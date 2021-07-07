import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PlatformService } from 'src/app/services/platform.service';
import { SellerService } from 'src/app/services/seller.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaderService } from 'src/app/services/leader.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { HelperService } from 'src/app/services/helper.service';
import { FileManagerService } from 'src/app/services/file-manager.service';
import * as uuid from 'node_modules/uuid';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.css'],
})
export class SellerComponent implements OnInit, OnDestroy {
  sellers = [];
  platforms = [];
  seller;
  selectedPlatform;
  platformName: string;
  selectedCard;
  imageAdded: boolean = false;
  cardImageAdded: boolean = false;
  tbsCertification: boolean = true;
  platformId: string;
  cards = [
    { id: 1, name: 'National ID Card' },
    { id: 2, name: 'Passport' },
    { id: 3, name: 'Drivers License' },
  ];
  idCard: File = null;
  tbsCertificationImage: File = null;

  leaderName: string;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  isLeader: boolean = false;

  constructor(
    private sellerService: SellerService,
    private platformService: PlatformService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private modal: NgbModal,
    private leaderService: LeaderService,
    private auth: AuthService,
    private helperService: HelperService,
    private fileService: FileManagerService
  ) {}

  addSellerForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    experience: new FormControl('', Validators.required),
    application_type: new FormControl('', Validators.required),
    website: new FormControl(''),
    category: new FormControl('', Validators.required),
    tbs_number: new FormControl(''),
    certification_number: new FormControl(''),
    platformID: new FormControl('', Validators.required),
    cardName: new FormControl('', Validators.required),
  });

  onUploadChange(event) {

    this.tbsCertificationImage = event.target.files[0]
    console.log(this.tbsCertificationImage)
    this.imageAdded = true;
  }

  onUploadCard(evt: any) {

    this.idCard = evt.target.files[0];
    console.log(this.idCard)
    this.cardImageAdded = true;
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };

    this.platformService.getPlatforms().subscribe((res) => {
      this.platforms = res.data.platform;
    });

    if (localStorage.getItem('role') == 'leader') {
      this.isLeader = true;

      this.auth.userInformation().subscribe((res) => {
        this.leaderName = res.data.user.name;

        this.leaderService.getPlatformFromLeader().subscribe((res) => {
          this.platformId = res.data;

          this.platformService.getPlatforms().subscribe((data) => {
            this.platformName = data.data.platform.find(
              (x) => x.id == this.platformId
            ).platform_name;

            this.sellerService
              .getSellerByPlatform(this.platformId)
              .subscribe((res) => {
                this.sellers = res.data.sellerInformations.filter(
                  (x) => x.platform_leader == this.leaderName
                );

                if (this.isDtInitialized) {
                  this.dtElement.dtInstance.then(
                    (dtInstance: DataTables.Api) => {
                      dtInstance.destroy();
                      this.dtTrigger.next();
                    }
                  );
                } else {
                  this.isDtInitialized = true;
                  this.dtTrigger.next();
                }
              });
          });
        });
      });
    } else {
      this.sellerService.getAllSellers().subscribe((res) => {
        this.sellers = res.data.sellerInformations;
        if (this.isDtInitialized) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        } else {
          this.isDtInitialized = true;
          this.dtTrigger.next();
        }
      });
    }
  }

  openViewSellerModal(seller, viewSeller) {
    this.seller = seller;
    console.log(seller);
    this.modal.open(viewSeller, { centered: true, size: 'lg' });
  }

  changeCertificationInput() {
    this.tbsCertification = !this.tbsCertification;
  }

  addTBSImage() {
    document.getElementById('tbsCertInput').click();
  }

  addCertImage() {
    document.getElementById('certInput').click();
  }

  addSeller() {
    document.getElementById('sellerModalClose').click();
    this.spinner.show();

    let tempId = uuid.v4();

    console.log('temporary ID is ', tempId)

    let formData: FormData = new FormData();
    console.log(this.idCard)
    formData.append('file', this.idCard, this.idCard.name);

   console.log(formData)

    //upload ID Card
    this.fileService
      .uploadTemporaryFile('idcard', tempId, formData)
      .subscribe((res) => {
        //check if TBS Certificate is added
        if (this.imageAdded) {
          let formTBSData = new FormData();
          formTBSData.append('file', this.tbsCertificationImage);

          //upload TBS Certificate
          this.fileService
            .uploadTemporaryFile('certificate', tempId, formTBSData)
            .subscribe((response) => {
              let data = {
                user: {
                  dial_code: '+255',
                  phone_number: this.addSellerForm.get('phone').value,
                  role: 'seller',
                  name: `${this.addSellerForm.get('firstName').value} ${
                    this.addSellerForm.get('lastName').value
                  }`,
                },
                seller: {
                  first_time: this.addSellerForm.get('firstName').value,
                  last_name: this.addSellerForm.get('lastName').value,
                  application_type: this.addSellerForm.get('application_type')
                    .value,
                  address: this.addSellerForm.get('address').value,
                  website: this.addSellerForm.get('website').value,
                  category: this.addSellerForm.get('category').value,
                  experience: this.addSellerForm.get('experience').value,
                  tbs_certification_number: this.addSellerForm.get('tbs_number')
                    .value,
                  certification_number: this.addSellerForm.get(
                    'certification_number'
                  ).value,
                  card_type: this.addSellerForm.get('cardName').value,
                },
                certificate: null,
              };

              this.sellerService
                .addSellerAdminLvl(
                  this.addSellerForm.get('platformID').value,
                  data
                )
                .subscribe(
                  (res) => {
                    console.log('reference after adding seller ',res.data)
                    this.fileService
                      .updateTemporaryFile(tempId, res.data)
                      .subscribe(() => {
                        this.helperService
                          .addToLogs({
                            action: `added seller ${data.user.name}`,
                          })
                          .subscribe(() => {
                            this.spinner.hide();

                            console.log('complete')

                            this.addSellerForm.reset();
                            this.ngOnInit();
                          });
                      });
                  },
                  (err) => {
                    this.spinner.hide();
                    this.toastr.error(err);
                  }
                );
            });
        } else {
          let data = {
            user: {
              dial_code: '+255',
              phone_number: this.addSellerForm.get('phone').value,
              role: 'seller',
              name: `${this.addSellerForm.get('firstName').value} ${
                this.addSellerForm.get('lastName').value
              }`,
            },
            seller: {
              first_time: this.addSellerForm.get('firstName').value,
              last_name: this.addSellerForm.get('lastName').value,
              application_type: this.addSellerForm.get('application_type')
                .value,
              address: this.addSellerForm.get('address').value,
              website: this.addSellerForm.get('website').value,
              category: this.addSellerForm.get('category').value,
              experience: this.addSellerForm.get('experience').value,
              tbs_certification_number: this.addSellerForm.get('tbs_number')
                .value,
              certification_number: this.addSellerForm.get(
                'certification_number'
              ).value,
              card_type: this.addSellerForm.get('cardName').value,
            },
            certificate: null,
          };

          this.sellerService
            .addSellerAdminLvl(this.addSellerForm.get('platformID').value, data)
            .subscribe(
              (res) => {
                this.fileService
                  .updateTemporaryFile(tempId, res.data)
                  .subscribe(() => {
                    console.log('reference after adding seller ',res.data)
                    this.fileService
                      .updateTemporaryFile(tempId, res.data)
                      .subscribe(() => {
                        this.helperService
                          .addToLogs({
                            action: `added seller ${data.user.name}`,
                          })
                          .subscribe(() => {
                            this.spinner.hide();

                            console.log('complete')

                            this.addSellerForm.reset();
                            this.ngOnInit();
                          });
                      });
                  });
              },
              (err) => {
                this.spinner.hide();
                this.toastr.error(err);
              }
            );
        }
      });
  }

  openDeleteSellerModal(deleteSellerModal, seller) {
    this.seller = seller;
    this.modal.open(deleteSellerModal, { centered: true });
  }

  deleteSellerAction(id) {
    this.modal.dismissAll();
    this.spinner.show();
    this.sellerService.deleteSeller(id).subscribe(
      () => {
        this.helperService
          .addToLogs({ action: `deleted seller.` })
          .subscribe(() => {
            this.spinner.hide();
            this.toastr.success('Seller deleted!');
            this.ngOnInit();
          });
      },
      () => {
        this.spinner.hide();
        this.toastr.error('Failed to delete seller!');
      }
    );
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

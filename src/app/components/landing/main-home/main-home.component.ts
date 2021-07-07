import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TenderGiven } from 'src/app/models/tender.model';
import { AuthService } from 'src/app/services/auth.service';
import { BuyerService } from 'src/app/services/buyer.service';
import { ChatService } from 'src/app/services/chat.service';
import { HelperService } from 'src/app/services/helper.service';
import { PlatformService } from 'src/app/services/platform.service';
import { SellerService } from 'src/app/services/seller.service';
import { TenderService } from 'src/app/services/tender.service';
import { VarietyService } from 'src/app/services/variety.service';
import * as moment from 'moment';
import * as firebase from 'firebase';

@Component({
  selector: 'app-main-home',
  templateUrl: './main-home.component.html',
  styleUrls: ['./main-home.component.css'],
})
export class MainHomeComponent implements OnInit, OnDestroy {
  platforms = [];
  sellers = [];
  buyers = [];
  tendersGiven: TenderGiven[] = [];
  tenderGiven;
  tenderRequestsFromSeller = [];
  qoutes = [];
  singleQoute;
  role;
  seller;
  currentUserSubject = new BehaviorSubject(localStorage.getItem('role'));
  languageSubscription: Subscription;
  buyerIdToSendReq: string;
  tenderId: string;
  varieties = [];
  varietyId: string;
  sellersGotten: boolean = false;
  platformsGotten: boolean = false;
  sellerVarietyOptions = [];
  tenderRequest;
  isGraded: boolean = true;
  batchCertified: boolean = true;
  isTBSCertified: boolean = false;
  selectedFile: any;
  isImageLoaded: boolean = false;
  en: boolean = false;
  allSellers = [];
  allBuyers = [];

  constructor(
    private platformService: PlatformService,
    private buyerService: BuyerService,
    private sellerService: SellerService,
    private tenderService: TenderService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private chat: ChatService,
    private router: Router,
    private varietyService: VarietyService,
    private helperService: HelperService,
    private helper: HelperService,
    private afDb: AngularFireDatabase
  ) {
    this.languageSubscription = this.helper
      .getLanguage()
      .subscribe((language) => {
        console.log('the current language is ', language);
        this.ngOnInit();
      });
  }

  checkIfGraded() {
    this.isGraded = !this.isGraded;
  }

  checkIfBatchCertified() {
    this.batchCertified = !this.batchCertified;
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  ngOnInit(): void {
    console.log('main home init called');

    if (localStorage.getItem('lang') === 'en') {
      this.en = true;
    } else {
      this.en = false;
    }

    this.sellerService.getAllSellers().subscribe(res => {
      this.allSellers = res.data.sellerInformations
    })

    this.buyerService.getAllBuyers().subscribe(res => {
      this.allBuyers = res.data
    })

    //get all sellers to display
    this.sellerService.getAllSellers().subscribe((res) => {
      this.sellers = res.data.sellerInformations
        .sort((a, b) => 0.5 - Math.random())
        .slice(0, 4);

      this.sellersGotten = true;
      console.log('sellers are ', this.sellers);  
    });

    this.varietyService.getAllVarieties().subscribe((res) => {
      this.varieties = res.data;
    });

    this.currentUserSubject.asObservable().subscribe((res) => {
      this.role = res;
      console.log(this.role);
      if (this.role == 'seller') {
        //get all buyers to display
        this.buyerService.getAllBuyers().subscribe((res) => {
          this.buyers = res.data
            .sort((a, b) => 0.5 - Math.random())
            .filter((a) => a.name !== null)
            .slice(0, 4);
        });

        //displayed to see tenders given to seller
        this.tenderService.getTenderGivenByBuyer().subscribe((res) => {
          this.tendersGiven = res.data
            .sort((a, b) => 0.5 - Math.random())
            .slice(0, 7);

          console.log('tenders given ', this.tendersGiven);
        });
      } else {
        this.buyerService.getTenderRequests().subscribe((res) => {
          this.tenderRequestsFromSeller = res.data;
          console.log('res is', res);
        });

        //display qoutations to start chat
        this.buyerService.getQouteFromBuyers().subscribe((res) => {
          // this.qoutes = res.data.filter((x) => x.active == 1);
          this.qoutes = res.data;
          console.log(this.qoutes);
        });
      }
    });

    //get all platforms to display
    this.platformService.getPlatforms().subscribe((res) => {
      this.platforms = res.data.platform
        .sort((a, b) => 0.5 - Math.random())
        .slice(0, 4);

      this.platformsGotten = true;
    });
  }

  giveTenderForm = new FormGroup({
    quantity: new FormControl('', Validators.required),
    grade: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    variety: new FormControl('', Validators.required),
  });

  openGiveTenderModal(giveTenderModal) {
    if (!localStorage.getItem('access_token')) {
      // return this.toastr.info('Please Login First before proceeding');
      console.log('clicked');
      this.modal.dismissAll();
      return this.helperService.toggleLogin.next(true);
    }

    this.modal.dismissAll();
    this.modal.open(giveTenderModal, { size: 'lg', centered: true });
  }

  openSellerModal(sellerId, sellerModal) {
    this.sellerService.getSingleSeller(sellerId).subscribe((res) => {
      this.seller = res.data;
      this.getVarietiesToChoose(res.data.platform_name);
      this.modal.open(sellerModal, { size: 'lg', centered: true });
    });
  }

  sendGiveTenderReq() {
    let data = {
      quantity: this.giveTenderForm.get('quantity').value,
      grade: String(this.giveTenderForm.get('grade').value),
      pickup_location: this.giveTenderForm.get('location').value,
      variety: this.giveTenderForm.get('variety').value,
      seller_selection: {
        seller_id: [{ id: this.seller.id }],
      },
    };

    this.sellerService.giveTender(data).subscribe(
      () => {
        // this.seller = null;
        this.giveTenderForm.reset();
        this.toastr.success('Tender Given');
        this.modal.dismissAll();
        this.ngOnInit();
      },
      (err) => {
        this.toastr.error('Failed to give tender');
      }
    );
  }

  openSendTenderReqModal(buyer, sendTenderRequestSellerToBuyer) {
    this.buyerIdToSendReq = buyer.id;
    this.auth.userInformation().subscribe((data) => {
      let thisSeller = data.data.user.id;

      this.sellerService.getSingleSeller(thisSeller).subscribe((res) => {
        this.getVarietiesToChoose(res.data.platform_name);

        if (res.data.is_tbs_certified == '') {
          this.isTBSCertified = false;
          this.batchCertified = true;
        } else {
          this.isTBSCertified = true;
          this.batchCertified = false;
        }

        this.modal.open(sendTenderRequestSellerToBuyer, {
          size: 'lg',
          centered: true,
        });
      });
    });
  }

  addBatchCertificationImage(event) {
    this.selectedFile = event.target.files[0];
    this.isImageLoaded = true;
  }

  openSendQouteModal(tender, sendQouteModal) {
    this.tenderId = tender.id;
    this.tenderGiven = tender;
    this.modal.open(sendQouteModal, { centered: true, size: 'lg' });
  }

  sellerToBuyerRequestForm = new FormGroup({
    quantity: new FormControl('', Validators.required),
    selling_price: new FormControl('', Validators.required),
    grade: new FormControl('', Validators.required),
    pickup_location: new FormControl('', Validators.required),
    extra_details: new FormControl('', Validators.required),
    variety: new FormControl('', Validators.required),
  });

  sendQouteForm = new FormGroup({
    supply_quantity: new FormControl(''),
    supply_price: new FormControl(''),
    supply_details: new FormControl(''),
  });

  sendQouteAction() {
    this.spinner.show();

    let data = {
      supply_quantity: this.sendQouteForm.get('supply_quantity').value,
      supply_price: this.sendQouteForm.get('supply_price').value,
      supply_details: this.sendQouteForm.get('supply_details').value,
    };

    this.tenderService.sendQouteToBuyer(this.tenderId, data).subscribe(
      (res) => {
        this.tenderService.acceptTender(this.tenderGiven.id).subscribe(
          () => {
            this.sendQouteForm.reset();
            this.modal.dismissAll();
            this.spinner.hide();
            this.toastr.success('Qoute sent to buyer');
            this.ngOnInit();
          },
          () => console.log('error on accepting tender')
        );
      },
      (err) => {
        this.toastr.error('Failed to send Qoute');
        this.spinner.hide();
      }
    );
  }

  cancelTenderActionBySeller() {
    this.spinner.show();
    this.tenderService.declineTender(this.tenderGiven.id).subscribe(
      () => {
        this.modal.dismissAll();
        this.spinner.hide();
        this.toastr.success('Tender declined');
        this.ngOnInit();
      },
      () => console.log('error on declining tender')
    );
  }

  sendRequestSellerToIndividualBuyer() {
    this.spinner.show();

    let data = {
      quantity: Number(this.sellerToBuyerRequestForm.get('quantity').value),
      selling_price: Number(
        this.sellerToBuyerRequestForm.get('selling_price').value
      ),
      is_graded: this.isGraded ? 1 : 2,
      grade: Number(this.sellerToBuyerRequestForm.get('grade').value),
      is_batch_certified: this.batchCertified ? 1 : 2,
      pickup_location:
        this.sellerToBuyerRequestForm.get('pickup_location').value,
      extra_details: this.sellerToBuyerRequestForm.get('extra_details').value,
      variety: this.sellerToBuyerRequestForm.get('variety').value,
      buyer_sellection: {
        ids: [
          {
            buyer_id: this.buyerIdToSendReq,
          },
        ],
      },
      document_string: this.selectedFile,
    };

    this.tenderService.sendTenderRequestSellerToBuyer(data).subscribe((res) => {
      this.sellerToBuyerRequestForm.reset();
      this.modal.dismissAll();
      this.spinner.hide();
      this.toastr.success('Request sent to buyer');
      this.ngOnInit();
    });
  }

  openQouteModal(qoute, qouteModal) {
    this.singleQoute = qoute;
    this.modal.open(qouteModal, { size: 'lg', centered: true });
  }

  createMessenger() {
    this.modal.dismissAll();
    this.spinner.show();
    let userID: string;
    this.auth.userInformation().subscribe((res) => {
      userID = res.data.user.id;
      console.log(userID);

      let data = {
        buyer_id: userID,
        seller_id: this.singleQoute.seller_id,
        quote_id: this.singleQoute.id,
      };

      this.tenderService.approveQoute(this.singleQoute.id).subscribe(() => {
        this.chat.createChatFromQoute(data).subscribe(() => {
          // this.spinner.hide();
          // this.router.navigate(['/home/buyers/chat']);

          let sellerInfo = this.allSellers.find(
            (x) => x.id === this.singleQoute.seller_id
          );
          let buyerInfo = this.allBuyers.find((x) => x.id === userID);
  
          //create messenger
          this.afDb.database.ref().child(`messenger/${userID}/${this.singleQoute.id}/`).set({
            seller_id: sellerInfo.id,
            seller: sellerInfo.full_name,
            seller_image_path: sellerInfo.image_path,
            expiration_status: false,
            messenger_id: userID,
            buyer_id: buyerInfo.id,
            buyer: buyerInfo.name,
            buyer_image_path: buyerInfo.image,
            chat_status: true,
            update_time: moment().valueOf(),
            quote_id: this.singleQoute.id
          }).then(() => {
            this.afDb.database.ref().child(`messenger/${sellerInfo.id}/${this.singleQoute.id}/`).set({
              seller_id: sellerInfo.id,
              seller: sellerInfo.full_name,
              seller_image_path: sellerInfo.image_path,
              expiration_status: false,
              messenger_id: userID,
              buyer_id: buyerInfo.id,
              buyer: buyerInfo.name,
              buyer_image_path: buyerInfo.image,
              chat_status: true,
              update_time: moment().valueOf(),
              quote_id: this.singleQoute.id
            })
          });
  
          this.spinner.hide();
  
          this.router.navigate(['/home/buyers/chat']);
        });
      });
    });
  }

  getVarietiesToChoose(platformName) {
    this.varietyService.getAllVarieties().subscribe((res) => {
      this.sellerVarietyOptions = res.data.filter(
        (x) => x.platform_name == platformName
      );
    });
  }

  cancelQoute() {
    this.spinner.show();
    this.tenderService.declineQoute(this.singleQoute.id).subscribe((res) => {
      this.modal.dismissAll();
      this.ngOnInit();
    });
  }

  openSellersByVarietyModal(sellerByVarietyModal) {
    this.modal.open(sellerByVarietyModal, { centered: true });
  }

  chooseVariety(id) {
    console.log(id);
    this.varietyId = id;
  }

  routeToSellersByVariety() {
    this.modal.dismissAll();
    this.router.navigate(['/home/sellers/by-variety/', this.varietyId]);
  }

  getJPGextension(data: string) {
    var field = data.split('.');
    var newField = field[0].concat('.jpg');
    // return newField
  }

  openTenderRequestFromSellerToBuyer(request, tenderRequestFromSellerModal) {
    this.tenderRequest = request;
    this.modal.open(tenderRequestFromSellerModal, {
      size: 'lg',
      centered: true,
    });
  }

  createMessengerForTenderRequest() {
    this.modal.dismissAll();
    this.spinner.show();
    let userID: string;
    this.auth.userInformation().subscribe((res) => {
      userID = res.data.user.id;
      console.log(userID);

      let data = {
        buyer_id: userID,
        seller_id: this.tenderRequest.sellerId,
        quote_id: this.tenderRequest.id,
      };

      this.tenderService.buyerAcceptTender(data.quote_id).subscribe(() => {
        this.chat.createChatFromQoute(data).subscribe(() => {
          this.spinner.hide();
          this.router.navigate(['/home/buyers/chat']);
        });
      });
    });
  }

  buyerDeclineTenderRequest() {
    this.modal.dismissAll();
    this.spinner.show();
    this.tenderService
      .buyerDeclineTender(this.tenderRequest.id)
      .subscribe(() => {
        this.spinner.hide();
        this.ngOnInit();
      });
  }

  //end of component class
}

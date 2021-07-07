import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Platform } from 'src/app/models/platform.model';
import { HelperService } from 'src/app/services/helper.service';
import { LeaderService } from 'src/app/services/leader.service';
import { PlatformService } from 'src/app/services/platform.service';
import * as uuid from 'node_modules/uuid';
import { FileManagerService } from 'src/app/services/file-manager.service';

@Component({
  selector: 'app-platforms',
  templateUrl: './platforms.component.html',
  styleUrls: ['./platforms.component.css'],
})
export class PlatformsComponent implements OnInit, OnDestroy {
  platforms: Platform;
  platform: any;
  platformImageFile: File = null;
  imageAdded: boolean = false;
  regions = [];
  dtOptions: DataTables.Settings = {};
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private platformService: PlatformService,
    private leaderService: LeaderService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private modal: NgbModal,
    private helperService: HelperService,
    private fileService: FileManagerService
  ) {}

  openViewPlatformModal(platform, openPlatform) {
    this.platform = platform;
    console.log(platform);
    this.modal.open(openPlatform, { size: 'lg', centered: true });
  }

  createPlatformForm = new FormGroup({
    platform_name: new FormControl('', Validators.required),
    platform_region: new FormControl('', Validators.required),
    platform_country_dial_code: new FormControl('+255', Validators.required),
    phone_number: new FormControl('', Validators.required),
    district: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
  });

  clickImgInput() {
    document.getElementById('img').click();
  }

  onUploadChange(evt: any) {
    this.platformImageFile = evt.target.files[0];
    this.imageAdded = true;
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };

    this.platformService.getPlatforms().subscribe((res) => {
      this.platforms = res;

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

    this.regions = this.helperService.getRegions();
  }

  savePlatform() {
    document.getElementById('platform-modal-close').click();
    this.spinner.show();

    let tempId = uuid.v4();

    let formData = new FormData();
    formData.append(
      'file',
      this.platformImageFile,
      this.platformImageFile.name
    );

    this.fileService
      .uploadTemporaryFile('platform', tempId, formData)
      .subscribe((response) => {
        let platformJsonObj = {
          platform_name: this.createPlatformForm.get('platform_name').value,
          platform_region: this.createPlatformForm.get('platform_region').value,
          platform_country_dial_code: '+255',
          platform_district: this.createPlatformForm.get('district').value,
          image_string: null,
        };

        let leaderJsonObj = {
          name: this.createPlatformForm.get('name').value,
          role: 'leader',
          dial_code: '+255',
          phone_number: this.createPlatformForm.get('phone_number').value,
        };

        this.platformService
          .createPlatform(platformJsonObj)
          .subscribe((res) => {
            var token = res.data;

            this.fileService.updateTemporaryFile(tempId, token).subscribe(
              () => {
                this.leaderService.createLeader(token, leaderJsonObj).subscribe(
                  (data) => {
                    this.helperService
                      .addToLogs({
                        action: `created ${
                          this.createPlatformForm.get('platform_name').value
                        }`,
                      })
                      .subscribe(() => {
                        this.spinner.hide();
                        this.createPlatformForm.reset();
                        this.imageAdded = false;
                        this.ngOnInit();
                      });
                  },
                  (error) => {
                    this.spinner.hide();
                    this.toastr.error('Failed to create Leader');
                  }
                );
              },
              (error) => {
                this.spinner.hide();
                this.toastr.error('Failed to Create Cluster');
              }
            );
          });
      });
  }

  openDeletePlatformModal(deletePlatformModal, platform) {
    this.platform = platform;
    this.modal.open(deletePlatformModal, { centered: true });
  }

  deletePlatformAction(id) {
    this.modal.dismissAll();
    this.platformService.deletePlatform(id).subscribe(
      (res) => {
        this.helperService
          .addToLogs({ action: `deleted cluster.` })
          .subscribe(() => {
            this.spinner.hide();
            this.toastr.success('Cluster deleted!');
            this.ngOnInit();
          });
      },
      () => {
        this.spinner.hide();
        this.toastr.error('Failed to delete Platform');
      }
    );
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

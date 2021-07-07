import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { PlatformService } from 'src/app/services/platform.service';
import { VarietyService } from 'src/app/services/variety.service';

@Component({
  selector: 'app-variety',
  templateUrl: './variety.component.html',
  styleUrls: ['./variety.component.css'],
})
export class VarietyComponent implements OnInit, OnDestroy {
  varieties = [];
  username: string;
  platformname: string;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  constructor(
    private service: VarietyService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private platformservice: PlatformService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };

    if (localStorage.getItem('role') == 'leader') {
      this.auth.userInformation().subscribe((res) => {
        this.username = res.data.user.name;

        this.platformservice.getPlatforms().subscribe((res) => {
          this.platformname = res.data.platform.find(
            (x) => x.leader_name == this.username
          ).platform_name;

          this.service.getAllVarieties().subscribe((res) => {
            this.varieties = res.data.filter(
              (x) => x.platform_name == this.platformname
            );
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
        });
      });
    } else {
      this.service.getAllVarieties().subscribe((res) => {
        this.varieties = res.data;
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

  varietyForm = new FormGroup({
    variety: new FormControl('', Validators.required),
  });

  openVarietyModal(addVariety) {
    this.modal.open(addVariety, { centered: true });
  }

  addVarietyAction() {
    this.modal.dismissAll();
    this.spinner.show();
    let data = {
      variety_name: this.varietyForm.get('variety').value,
    };

    this.service.addVariety(data).subscribe(
      (res) => {
        this.helper
          .addToLogs({ action: `added ${data.variety_name} variety` })
          .subscribe(() => {
            this.varietyForm.reset();
            this.spinner.hide();
            this.toastr.success('Variety added!');
            this.ngOnInit();
          });
      },
      (err) => {
        this.toastr.error('Failed to add Variety');
        this.spinner.hide();
      }
    );
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { PriceRate } from 'src/app/models/price.model';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { PlatformService } from 'src/app/services/platform.service';
import { PriceService } from 'src/app/services/price.service';
import { VarietyService } from 'src/app/services/variety.service';

@Component({
  selector: 'app-market-price',
  templateUrl: './market-price.component.html',
  styleUrls: ['./market-price.component.css'],
})
export class MarketPriceComponent implements OnInit, OnDestroy {
  priceRate: PriceRate;
  varieties = [];
  username: string;
  platformname: string;
  regions = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  constructor(
    private priceService: PriceService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private platformService: PlatformService,
    private varietyService: VarietyService,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };

    this.priceService.getPriceRate().subscribe((res) => {
      this.priceRate = res;
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

    this.regions = this.helperService.getRegions().sort((a,b) => a.name.localeCompare(b.name))

    if(localStorage.getItem('role') == 'leader'){
      this.auth.userInformation().subscribe((res) => {
        this.username = res.data.user.name;
  
        this.platformService.getPlatforms().subscribe((res) => {
          this.platformname = res.data.platform.find(
            (x) => x.leader_name == this.username
          ).platform_name;
  
          this.varietyService.getAllVarieties().subscribe((res) => {
            this.varieties = res.data.sort((a, b) => a.variety_name.localeCompare(b.variety_name))

          });
        });
      });
    } else {
      this.varietyService.getAllVarieties().subscribe(res => {
        this.varieties = res.data.sort((a, b) => a.variety_name.localeCompare(b.variety_name))
      })
    }


  
  }

  addPriceForm = new FormGroup({
    priceRate: new FormControl('', Validators.required),
    region: new FormControl('', Validators.required),
    variety: new FormControl('', Validators.required),
  });

  openAddPriceModal(addPriceModal) {
    this.modal.open(addPriceModal, { centered: true });
  }

  addPriceAction() {
    this.modal.dismissAll();
    this.spinner.show();

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let currentDate = dd + ' ' + mm + ' ' + yyyy;

    let data = {
      price_rate: this.addPriceForm.get('priceRate').value,
      region: this.addPriceForm.get('region').value,
      variety: this.addPriceForm.get('variety').value,
      date: currentDate,
    };

    this.priceService.addPrice(data).subscribe(
      (res) => {
        this.helperService
          .addToLogs({
            action: `added price rate for ${data.variety} at ${data.price_rate}`,
          })
          .subscribe(() => {
            this.spinner.hide();
            this.addPriceForm.reset();
            this.toastr.success('Price Rate Added!');
            this.ngOnInit();
          });
      },
      () => {
        this.spinner.hide();
        this.toastr.error('Failed to add Price rate');
      }
    );
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

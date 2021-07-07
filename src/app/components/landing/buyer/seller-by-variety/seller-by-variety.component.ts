import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
import { SellerService } from 'src/app/services/seller.service';
import { VarietyService } from 'src/app/services/variety.service';

@Component({
  selector: 'app-seller-by-variety',
  templateUrl: './seller-by-variety.component.html',
  styleUrls: ['./seller-by-variety.component.css'],
})
export class SellerByVarietyComponent implements OnInit, OnDestroy {
  sellers = [];
  sellerIdToSend: string;
  allowGiveAll: boolean = false;
  numberOfSellersChosen = [];
  varietyName: string;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtElement: DataTableDirective;
  isDtInitialized:boolean = false
  en: boolean = false
  languageSubsription: Subscription

  constructor(
    private route: ActivatedRoute,
    private sellerService: SellerService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private renderer: Renderer2,
    private varietyService: VarietyService,
    private helperService: HelperService,
    private location: Location
  ) {this.languageSubsription = this.helperService.getLanguage().subscribe(language => { this.ngOnInit() })}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };

    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else {
      this.en = false
    }

    window.scrollTo(500, 0);
    const id = this.route.snapshot.paramMap.get('varietyId');

    this.varietyService.getAllVarieties().subscribe(res => {
      this.varietyName = res.data.find(x => x.id == id).variety_name

      console.log('the variety name is ',this.varietyName)
    })

    this.sellerService.getSellerByVariety(id).subscribe((res) => {
      this.sellers = res.data.map((x) => ({
        ...x,
        selected: false
      }));

      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      } else {
        this.isDtInitialized = true
        this.dtTrigger.next();
      }

    });
  }

  backClicked(){
    this.location.back()
  }

  giveTender(seller, tenderToSellersModal) {
    if (!localStorage.getItem('access_token')) {
      console.log('clicked');
      this.modal.dismissAll();
      this.helperService.toggleLogin.next(true);
      return this.ngOnInit();
    }

    this.sellerIdToSend = seller.id

    this.modal
      .open(tenderToSellersModal, { size: 'lg', centered: true })
  }

  addSellerViaCheckBox(seller) {
    seller.selected = !seller.selected;
    this.allowGiveAll = this.sellers.some((x) => x.selected == true);
  }

  openModalForMultipleSellers(tenderToMultipleSellersModal) {
    if (!localStorage.getItem('access_token')) {
      this.renderer.selectRootElement(document.getElementById('check-all-input')).checked = false
      this.modal.dismissAll();
      this.helperService.toggleLogin.next(true);
      return this.ngOnInit();
    }

    this.numberOfSellersChosen = this.sellers.filter((x) => x.selected == true)

    this.modal
      .open(tenderToMultipleSellersModal, { size: 'lg', centered: true })
  }

  giveTenderForm = new FormGroup({
    quantity: new FormControl('', Validators.required),
    grade: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    variety: new FormControl('', Validators.required)
  });

  giveTenderRequestsToMultiple(){
    this.spinner.show()

    let data = {
      quantity: Number(this.giveTenderForm.get('quantity').value),
      grade: Number(this.giveTenderForm.get('grade').value),
      pickup_location: this.giveTenderForm.get('location').value,
      variety: this.varietyName,
      seller_selection: {
        seller_id: this.sellers.filter((x) => x.selected == true).map((x) => ({ id: x.id }))
      },
    };

    this.sellerService.giveTender(data).subscribe((res) => {
      this.giveTenderForm.reset();
      this.modal.dismissAll();
      this.spinner.hide()
      this.toastr.success('Tender Given');
      this.ngOnInit();
    }, err => {
      this.spinner.hide()
      this.toastr.error('Failed to submit tender request')
    });
  }

  sendGiveTenderReq() {
    let data = {
      quantity: Number(this.giveTenderForm.get('quantity').value),
      grade: Number(this.giveTenderForm.get('grade').value),
      pickup_location: this.giveTenderForm.get('location').value,
      variety: this.varietyName,
      seller_selection: {
        seller_id: [
          {
            id: this.sellerIdToSend
          }
        ]
      },
    };

    this.sellerService.giveTender(data).subscribe((res) => {
      this.giveTenderForm.reset();
      this.modal.dismissAll();
      this.toastr.success('Tender Given');
      this.ngOnInit();
    }, err => {
      this.spinner.hide()
      this.toastr.error('Failed to submit tender request')
    });
  }

  checkAll() {
    this.sellers.forEach((x) => (x.selected = !x.selected));
    this.allowGiveAll = this.sellers.some((x) => x.selected == true);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.languageSubsription.unsubscribe()
  }

}

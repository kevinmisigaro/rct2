import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/services/helper.service';
import { SellerService } from 'src/app/services/seller.service';

@Component({
  selector: 'app-sellers-list',
  templateUrl: './sellers-list.component.html',
  styleUrls: ['./sellers-list.component.css'],
})
export class SellersListComponent implements OnInit {
  sellers = [];
  sellerIdToSend: string;
  allowGiveAll: boolean = false;
  numberOfSellersChosen = []

  constructor(
    private sellerService: SellerService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private renderer: Renderer2,
    private helperService: HelperService
  ) {}

  ngOnInit(): void {

    this.sellerService.getAllSellers().subscribe((res) => {
      this.sellers = res.data.sellerInformations.map((x) => ({
        ...x,
        selected: false
      }));;
    });
  }

  giveTender(seller, tenderToSellersModal) {
    if (!localStorage.getItem('access_token')) {
      // this.toastr.info('Please Login First before proceeding');
      // return this.ngOnInit();
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
      this.toastr.info('Please Login First before proceeding');
      this.renderer.selectRootElement(document.getElementById('check-all-input')).checked = false
      this.modal.dismissAll();
      return this.helperService.toggleLogin.next(true);
      // return this.ngOnInit();
    }

    this.numberOfSellersChosen = this.sellers.filter((x) => x.selected == true)

    this.modal
      .open(tenderToMultipleSellersModal, { size: 'lg', centered: true })
  }

  giveTenderForm = new FormGroup({
    quantity: new FormControl('', Validators.required),
    grade: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    variety: new FormControl('', Validators.required),
  });

  giveTenderRequestsToMultiple(){
    this.spinner.show()

    let data = {
      quantity: Number(this.giveTenderForm.get('quantity').value),
      grade: Number(this.giveTenderForm.get('grade').value),
      pickup_location: this.giveTenderForm.get('location').value,
      variety: this.giveTenderForm.get('variety').value,
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
      variety: this.giveTenderForm.get('variety').value,
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
}

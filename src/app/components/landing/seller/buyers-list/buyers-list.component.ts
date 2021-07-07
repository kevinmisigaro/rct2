import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { BuyerService } from 'src/app/services/buyer.service';
import { HelperService } from 'src/app/services/helper.service';
import { SellerService } from 'src/app/services/seller.service';
import { TenderService } from 'src/app/services/tender.service';
import { VarietyService } from 'src/app/services/variety.service';

@Component({
  selector: 'app-buyers-list',
  templateUrl: './buyers-list.component.html',
  styleUrls: ['./buyers-list.component.css'],
})
export class BuyersListComponent implements OnInit, OnDestroy {
  buyers = [];
  buyerIdToSendReq: string;
  tenderId: string;
  buyersSentRequests = [];
  buyerIdsSentRequests = [];
  allowGiveAll: boolean = false;
  sellerVarietyOptions = []
  isGraded: boolean = true;
  batchCertified: boolean = true;
  isTBSCertified: boolean = false;
  selectedFile: any;
  isImageLoaded: boolean = false
  en: boolean = false
  languageSubsription: Subscription

  constructor(
    private buyerService: BuyerService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private tenderService: TenderService,
    private varietyService: VarietyService,
    private auth: AuthService,
    private sellerService: SellerService,
    private helper: HelperService
  ) {this.languageSubsription = this.helper.getLanguage().subscribe(language => { this.ngOnInit() })}

  checkIfGraded(){
    this.isGraded = !this.isGraded
  }

  checkIfBatchCertified(){
    this.batchCertified = !this.batchCertified
  }

  ngOnDestroy():void{
    this.languageSubsription.unsubscribe()
  }

  ngOnInit(): void {
    
    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else {
      this.en = false
    }

    this.buyerService.getAllBuyers().subscribe((res) => {
      this.buyers = res.data.map((x) => ({
        ...x,
        selected: false,
        buyer_id: x.id,
      }));
    });
  }

  getVarietiesToChoose(platformName){
    this.varietyService.getAllVarieties().subscribe(res => {
      this.sellerVarietyOptions = res.data.filter( x => x.platform_name == platformName )
    })
  }

  openSendTenderReqModal(buyer, sendTenderRequestSellerToBuyer) {
    this.buyerIdToSendReq = buyer.id;
  
    this.auth.userInformation().subscribe(data => {
      let thisSeller = data.data.user.id


      this.sellerService.getSingleSeller(thisSeller).subscribe(res => {

        if(res.data.is_tbs_certified == ""){
          this.isTBSCertified = false
          this.batchCertified = true
        } else{
          this.isTBSCertified = true
          this.batchCertified = false
        }
        
        this.getVarietiesToChoose(res.data.platform_name)

        this.modal.open(sendTenderRequestSellerToBuyer, {
          size: 'lg',
          centered: true,
        });

      })
    })
  }

  addBatchCertificationImage(event) {
    this.selectedFile = event.target.files[0]
    this.isImageLoaded = true
  }

  sendRequestSellerToMultipleBuyer() {
    this.spinner.show();

    let data = {
      quantity: Number(this.sellerToBuyerRequestForm.get('quantity').value),
      selling_price: Number(this.sellerToBuyerRequestForm.get('selling_price').value),
      is_graded: this.isGraded ? 1 : 2,
      grade: Number(this.sellerToBuyerRequestForm.get('grade').value),
      is_batch_certified: this.batchCertified ? 1 : 2,
      pickup_location: this.sellerToBuyerRequestForm.get('pickup_location').value,
      extra_details: this.sellerToBuyerRequestForm.get('extra_details').value,
      variety: this.sellerToBuyerRequestForm.get('variety').value,
      buyer_sellection: {
        ids: this.buyers
          .filter((x) => x.selected == true)
          .map((x) => ({ buyer_id: x.buyer_id }))
      },
      document_string: this.selectedFile,
    };

    this.tenderService.sendTenderRequestSellerToBuyer(data).subscribe((res) => {
      this.sellerToBuyerRequestForm.reset();
      this.modal.dismissAll();
      this.spinner.hide();
      this.ngOnInit();
    });
  }

  openSendTednerReqMultipleModal(sendTenderRequestSellerToBuyerMultiple) {
    this.auth.userInformation().subscribe(data => {
      let thisSeller = data.data.user.id

      this.sellerService.getSingleSeller(thisSeller).subscribe(res => {

        if(res.data.is_tbs_certified == ""){
          this.isTBSCertified = false
          this.batchCertified = true
        } else{
          this.isTBSCertified = true
          this.batchCertified = false
        }
        
        this.getVarietiesToChoose(res.data.platform_name)

        this.modal.open(sendTenderRequestSellerToBuyerMultiple, {
          size: 'lg',
          centered: true,
        });

      })
    })
  }

  sellerToBuyerRequestForm = new FormGroup({
    quantity: new FormControl('', Validators.required),
    selling_price: new FormControl('', Validators.required),
    grade: new FormControl('', Validators.required),
    pickup_location: new FormControl('', Validators.required),
    extra_details: new FormControl('', Validators.required),
    variety: new FormControl('', Validators.required),
  });

  sendRequestSellerToIndividualBuyer() {
    this.spinner.show();

    let data = {
      quantity: Number(this.sellerToBuyerRequestForm.get('quantity').value),
      selling_price: Number(this.sellerToBuyerRequestForm.get('selling_price').value),
      is_graded: this.isGraded ? 1 : 2,
      grade: Number(this.sellerToBuyerRequestForm.get('grade').value),
      is_batch_certified: this.batchCertified ? 1 : 2,
      pickup_location: this.sellerToBuyerRequestForm.get('pickup_location').value,
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
      this.ngOnInit();
    });
  }

  checkAll() {
    this.buyers.forEach((x) => (x.selected = !x.selected));
    this.allowGiveAll = this.buyers.some((x) => x.selected == true);
  }

  checkValue(buyer) {
    buyer.selected = !buyer.selected;
    this.allowGiveAll = this.buyers.some((x) => x.selected == true);
  }
}

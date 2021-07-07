import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { BuyerService } from 'src/app/services/buyer.service';

@Component({
  selector: 'app-buyer',
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.css']
})
export class BuyerComponent implements OnInit, OnDestroy {
  buyers = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtElement: DataTableDirective;
  isDtInitialized:boolean = false

  constructor(private buyerService: BuyerService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };

    this.buyerService.getAllBuyers().subscribe(res => {
      // this.buyers = res.data.filter(x => x.name != null);
      this.buyers = res.data;
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      } else {
        this.isDtInitialized = true
        this.dtTrigger.next();
      }
    })
  }

  deleteBuyer(buyerId){
    this.buyerService.deleteBuyer(buyerId).subscribe(() => {
      this.toastr.success('Buyer deleted successfully')
      this.ngOnInit()
    })
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

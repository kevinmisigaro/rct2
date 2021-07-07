import { Component, OnInit } from '@angular/core';
import { TenderService } from 'src/app/services/tender.service';

@Component({
  selector: 'app-tender-requests',
  templateUrl: './tender-requests.component.html',
  styleUrls: ['./tender-requests.component.css']
})
export class TenderRequestsComponent implements OnInit {
  tendersRequested = []

  constructor(private tenderService: TenderService) { }

  ngOnInit(): void {
    this.tenderService.getTenderRequests().subscribe(res => {
      this.tendersRequested = res.data.requestTenderList
    })
  }

}

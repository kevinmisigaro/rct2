import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PriceService } from 'src/app/services/price.service';

@Component({
  selector: 'app-price-history',
  templateUrl: './price-history.component.html',
  styleUrls: ['./price-history.component.css']
})
export class PriceHistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute, private priceService: PriceService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('priceId');

    
  }

}

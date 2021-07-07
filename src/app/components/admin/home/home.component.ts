import { Component, OnInit } from '@angular/core';
import { Count } from 'src/app/models/helper.model';
import { PriceRate } from 'src/app/models/price.model';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { LeaderService } from 'src/app/services/leader.service';
import { PriceService } from 'src/app/services/price.service';
import { SellerService } from 'src/app/services/seller.service';
import { VarietyService } from 'src/app/services/variety.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  count: Count;
  countLoaded: boolean = false;
  priceRate: PriceRate;
  role: string;
  platformID: string;
  sellerCountByPlatform: number;
  varietiesCountByPlatform: number;

  constructor(
    private countService: HelperService,
    private priceService: PriceService,
    private leaderService: LeaderService,
    private sellerService: SellerService,
    private varietyService: VarietyService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.countService.getCount().subscribe((res) => {
      this.count = res;
      this.countLoaded = true;
    });

    this.priceService.getPriceRate().subscribe((res) => {
      this.priceRate = res;
    });

    localStorage.getItem('role') == 'leader' ? this.role = 'leader' : this.role = 'admin'

    if(localStorage.getItem('role') == 'leader'){
      this.leaderService.getPlatformFromLeader().subscribe(res => {
        this.platformID = res.data
        console.log('platform id is ', this.platformID)

        this.sellerService.getSellerByPlatform(this.platformID).subscribe(res => {
          this.sellerCountByPlatform = res.data.item_count
        })

        this.auth.userInformation().subscribe(res => {

          this.varietyService.getAllVarieties().subscribe(data => {
            this.varietiesCountByPlatform = data.data.filter(x => x.user_name == res.data.user.name).length
          })

        })
        
      })
    }
  }

}

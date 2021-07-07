import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
import { PlatformService } from 'src/app/services/platform.service';

@Component({
  selector: 'app-platforms-list',
  templateUrl: './platforms-list.component.html',
  styleUrls: ['./platforms-list.component.css']
})
export class PlatformsListComponent implements OnInit, OnDestroy{
  platforms = []
  languageSubsription: Subscription
  en: boolean = false

  constructor(private platformService: PlatformService, private location: Location, private helper: HelperService) {
    this.languageSubsription = this.helper.getLanguage().subscribe(language => { this.ngOnInit() })
   }

   ngOnDestroy(): void {
    this.languageSubsription.unsubscribe()
   }

  ngOnInit(): void {

    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else {
      this.en = false
    }

    window.scrollTo(500, 0);

    this.platformService.getPlatforms().subscribe(res => {
      this.platforms = res.data.platform
    })
  }

  backButton(){
    this.location.back()
  }

}

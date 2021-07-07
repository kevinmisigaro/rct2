import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { AdminComponent } from './components/admin/admin.component';

import { JwtModule } from '@auth0/angular-jwt';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TokenInterceptor } from './services/token.interceptor';
import { SidenavComponent } from './components/admin/sidenav/sidenav.component';
import { MainnavComponent } from './components/admin/mainnav/mainnav.component';
import { HomeComponent } from './components/admin/home/home.component';
import { DataTablesModule } from 'angular-datatables';
import { PlatformsComponent } from './components/admin/platforms/platforms.component';
import { LeaderComponent } from './components/admin/users/leader/leader.component';
import { SellerComponent } from './components/admin/users/seller/seller.component';
import { BuyerComponent } from './components/admin/users/buyer/buyer.component';
import { MarketPriceComponent } from './components/admin/market-price/market-price.component';
import { VarietyComponent } from './components/admin/variety/variety.component';
import { LogsComponent } from './components/admin/logs/logs.component';
import { BannersComponent } from './components/admin/banners/banners.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TenderRequestsComponent } from './components/admin/tender-requests/tender-requests.component';
import { TenderGivenComponent } from './components/admin/tender-given/tender-given.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import {
  APP_BASE_HREF,
  CommonModule,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminsComponent } from './components/admin/users/admins/admins.component';
import { NavigationBarComponent } from './components/landing/navigation-bar/navigation-bar.component';
import { MainHomeComponent } from './components/landing/main-home/main-home.component';

import { SellerByPlatformComponent } from './components/landing/buyer/seller-by-platform/seller-by-platform.component';
import { PlatformsListComponent } from './components/landing/buyer/platforms-list/platforms-list.component';
import { BuyersListComponent } from './components/landing/seller/buyers-list/buyers-list.component';
import { BuyerChatComponent } from './components/landing/buyer/buyer-chat/buyer-chat.component';
import { SellersListComponent } from './components/landing/buyer/sellers-list/sellers-list.component';
import { SellerChatComponent } from './components/landing/seller/seller-chat/seller-chat.component';
import { SellerByVarietyComponent } from './components/landing/buyer/seller-by-variety/seller-by-variety.component';
import { PriceHistoryComponent } from './components/admin/market-price/price-history/price-history.component';
import { ProfileComponent } from './components/admin/profile/profile.component';
import { UserProfileComponent } from './components/landing/user-profile/user-profile.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { BuyerFirebaseChatComponent } from './components/landing/buyer/buyer-firebase-chat/buyer-firebase-chat.component';
import { SellerFirebaseChatComponent } from './components/landing/seller/seller-firebase-chat/seller-firebase-chat.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    AdminComponent,
    SidenavComponent,
    MainnavComponent,
    HomeComponent,
    PlatformsComponent,
    LeaderComponent,
    SellerComponent,
    BuyerComponent,
    MarketPriceComponent,
    VarietyComponent,
    LogsComponent,
    BannersComponent,
    TenderRequestsComponent,
    TenderGivenComponent,
    AdminsComponent,
    NavigationBarComponent,
    MainHomeComponent,
    SellersListComponent,
    SellerByPlatformComponent,
    PlatformsListComponent,
    BuyersListComponent,
    BuyerChatComponent,
    SellerChatComponent,
    SellerByVarietyComponent,
    PriceHistoryComponent,
    ProfileComponent,
    UserProfileComponent,
    BuyerFirebaseChatComponent,
    SellerFirebaseChatComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgxSpinnerModule,
    CommonModule,
    NgSelectModule,
    NgxShimmerLoadingModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
    JwtModule.forRoot({
      config: {
        tokenGetter: function tokenGetter() {
          return localStorage.getItem('access_token');
        },
        allowedDomains: ['https://rctapp.co.tz:1122/api/v1'],
        disallowedRoutes: [],
      },
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AppRoutingModule,
    NgbModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { BannersComponent } from './components/admin/banners/banners.component';
import { HomeComponent } from './components/admin/home/home.component';
import { LogsComponent } from './components/admin/logs/logs.component';
import { MarketPriceComponent } from './components/admin/market-price/market-price.component';
import { PlatformsComponent } from './components/admin/platforms/platforms.component';
import { TenderGivenComponent } from './components/admin/tender-given/tender-given.component';
import { TenderRequestsComponent } from './components/admin/tender-requests/tender-requests.component';
import { AdminsComponent } from './components/admin/users/admins/admins.component';
import { BuyerComponent } from './components/admin/users/buyer/buyer.component';
import { LeaderComponent } from './components/admin/users/leader/leader.component';
import { SellerComponent } from './components/admin/users/seller/seller.component';
import { VarietyComponent } from './components/admin/variety/variety.component';
import { BuyerChatComponent } from './components/landing/buyer/buyer-chat/buyer-chat.component';
import { BuyersListComponent } from './components/landing/seller/buyers-list/buyers-list.component';
import { LandingComponent } from './components/landing/landing.component';
import { MainHomeComponent } from './components/landing/main-home/main-home.component';
import { PlatformsListComponent } from './components/landing/buyer/platforms-list/platforms-list.component';
import { SellerByPlatformComponent } from './components/landing/buyer/seller-by-platform/seller-by-platform.component';
import { SellersListComponent } from './components/landing/buyer/sellers-list/sellers-list.component';
import { SellerChatComponent } from './components/landing/seller/seller-chat/seller-chat.component';
import { SellerByVarietyComponent } from './components/landing/buyer/seller-by-variety/seller-by-variety.component';
import { PriceHistoryComponent } from './components/admin/market-price/price-history/price-history.component';
import { ProfileComponent } from './components/admin/profile/profile.component';
import { UserProfileComponent } from './components/landing/user-profile/user-profile.component';
import { BuyerFirebaseChatComponent } from './components/landing/buyer/buyer-firebase-chat/buyer-firebase-chat.component';
import { SellerFirebaseChatComponent } from './components/landing/seller/seller-firebase-chat/seller-firebase-chat.component';


const routes: Routes = [
  {
    path: 'home',
    component: LandingComponent,
    children: [
      { path: 'main', component: MainHomeComponent },
      { path: 'buyers/list', component: BuyersListComponent },
      { path: 'sellers/list', component: SellersListComponent },
      // { path: 'buyers/chat', component: BuyerChatComponent },
      { path: 'buyers/chat', component: BuyerFirebaseChatComponent },
      // { path: 'sellers/chat', component: SellerChatComponent },
      { path: 'sellers/chat', component: SellerFirebaseChatComponent },
      { path: 'profile', component: UserProfileComponent },
      {
        path: 'sellers/by-platform/:platformId',
        component: SellerByPlatformComponent,
      },
      {
        path: 'sellers/by-variety/:varietyId',
        component: SellerByVarietyComponent,
      },
      { path: 'platforms-list', component: PlatformsListComponent },
      { path: '', pathMatch: 'full', redirectTo: 'main' },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'platforms', component: PlatformsComponent },
      { path: 'leader', component: LeaderComponent },
      { path: 'seller', component: SellerComponent },
      { path: 'admins', component: AdminsComponent },
      { path: 'buyer', component: BuyerComponent },
      { path: 'market-price', component: MarketPriceComponent },
      { path: 'price-history/:priceId', component: PriceHistoryComponent },
      { path: 'banners', component: BannersComponent },
      { path: 'variety', component: VarietyComponent },
      { path: 'tenders/requests', component: TenderRequestsComponent },
      { path: 'tenders/given', component: TenderGivenComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { pathMatch: 'full', redirectTo: 'home', path: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

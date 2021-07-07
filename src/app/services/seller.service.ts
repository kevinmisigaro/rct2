import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QoutesFromSellers } from '../models/buyer.model';
import { Seller, SingleSeller, VarietySeller } from '../models/seller.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getAllSellers(): Observable<Seller> {
    return this.http.get<Seller>(`${this.config.apiUrl}/seller/offset/0`);
  }

  addSellerAdminLvl(platformToken, data): Observable<{ data: string }> {
    return this.http.post<{ data: string }>(
      `${this.config.apiUrl}/seller/${platformToken}`,
      data
    );
  }

  getSingleSeller(id): Observable<SingleSeller> {
    return this.http.get<SingleSeller>(`${this.config.apiUrl}/seller/${id}`);
  }

  getSellerByPlatform(id): Observable<Seller> {
    return this.http.get<Seller>(
      `${this.config.apiUrl}/seller/platform/${id}/offset/0`
    );
  }

  getSellerByVariety(id): Observable<VarietySeller>{
    return this.http.post<VarietySeller>(`${this.config.apiUrl}/seller/variety/${id}`, {});
  }

  getAllSentQoutes(): Observable<QoutesFromSellers>{
    return this.http.get<QoutesFromSellers>(`${this.config.apiUrl}/quote/seller`);
  }

  giveTender(data){
    return this.http.post(`${this.config.apiUrl}/buyer/give-tender`, data)
  }

  deleteSeller(id){
    return this.http.delete(`${this.config.apiUrl}/seller/${id}`);
  }
}

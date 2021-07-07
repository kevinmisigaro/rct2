import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Buyer, QoutesFromSellers } from '../models/buyer.model';
import { TenderRequestFromSeller } from '../models/tender.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getAllBuyers(): Observable<Buyer>{
    return this.http.get<Buyer>(`${this.config.apiUrl}/buyer/all-buyer`)
  }

  getTenderRequests(): Observable<TenderRequestFromSeller>{
    return this.http.get<TenderRequestFromSeller>(`${this.config.apiUrl}/buyer/tender-request`)
  }

  getQouteFromBuyers():Observable<QoutesFromSellers>{
    //finish code
    return this.http.get<QoutesFromSellers>(`${this.config.apiUrl}/quote/buyer`)
  }

  deleteBuyer(id){
    return this.http.delete(`${this.config.apiUrl}/buyer/${id}`)
  }
}

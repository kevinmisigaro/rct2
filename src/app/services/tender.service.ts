import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tender } from '../models/tender.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class TenderService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getTenderRequests(): Observable<Tender>{
    return this.http.get<Tender>(`${this.config.apiUrl}/seller/tender/offset/0`);
  }

  getTenderGivenByBuyer(): Observable<any>{
    return this.http.get<any>(`${this.config.apiUrl}/seller/tender-given`);
  }

  sendTenderRequestSellerToBuyer(data){
    return this.http.post(`${this.config.apiUrl}/seller/tender`, data)
  }

  sendQouteToBuyer(tenderId, data){
    return this.http.post(`${this.config.apiUrl}/quote/tender/${tenderId}`, data)
  }

  approveQoute(id){
    return this.http.put(`${this.config.apiUrl}/quote/approve/${id}`, {})
  }

  declineQoute(id){
    return this.http.put(`${this.config.apiUrl}/quote/decline/${id}`, {})
  }

  acceptTender(id){
    return this.http.put(`${this.config.apiUrl}/seller/tender/accept/${id}`, {})
  }

  declineTender(id){
    return this.http.put(`${this.config.apiUrl}/seller/tender/decline/${id}`, {})
  }

  buyerAcceptTender(id){
    return this.http.put(`${this.config.apiUrl}/buyer/tender/accept/${id}`, {})
  }

  buyerDeclineTender(id){
    return this.http.put(`${this.config.apiUrl}/buyer/tender/decline/${id}`, {})
  }

}

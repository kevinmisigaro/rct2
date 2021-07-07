import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PriceRate } from '../models/price.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getPriceRate(): Observable<PriceRate>{
    return this.http.get<PriceRate>(`${this.config.apiUrl}/price-rate`)
  }

  addPrice(data){
    return this.http.post(`${this.config.apiUrl}/price-rate`, data);
  }

  getPriceHistory(){
    return this.http.get(`${this.config.apiUrl}/price-rate-history/offset/0`);
  }
}


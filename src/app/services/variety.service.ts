import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Variety } from '../models/variety.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class VarietyService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getAllVarieties(): Observable<Variety>{
    return this.http.get<Variety>(`${this.config.apiUrl}/variety`);
  }

  addVariety(data) {
    return this.http.post(`${this.config.apiUrl}/variety`, data);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Leader, LeaderFromPlatform } from '../models/leader.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getAllLeaders(): Observable<Leader>{
    return this.http.get<Leader>(`${this.config.apiUrl}/leader`)
  }

  createLeader(token, data){
    return this.http.post(`${this.config.apiUrl}/leader/${token}`, data)
  }

  getPlatformFromLeader(): Observable<{ data: string }>{
    return this.http.get<{ data: string }>(`${this.config.apiUrl}/leader/leader-platform`)
  }

  getLeaderFromPlatform(id): Observable<LeaderFromPlatform>{
    return this.http.get<LeaderFromPlatform>(`${this.config.apiUrl}/leader/platform/${id}`)
  }

}

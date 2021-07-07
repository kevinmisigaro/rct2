import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePlatformToken, Platform } from '../models/platform.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getPlatforms(): Observable<Platform>{
    return this.http.get<Platform>(`${this.config.apiUrl}/platform/offset/0`);
  }

  createPlatform(data): Observable<CreatePlatformToken>{
    return this.http.post<CreatePlatformToken>(`${this.config.apiUrl}/platform`, data);
  }

  deletePlatform(id){
    return this.http.delete(`${this.config.apiUrl}/platform/${id}`);
  }
}

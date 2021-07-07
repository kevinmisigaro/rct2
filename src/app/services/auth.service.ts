import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { JwtToken, UserInformation } from './../models/auth.model';
import { Router } from '@angular/router';

export class LoginResponse{
  data: string
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private router: Router
  ) {}

  login(data): Observable<JwtToken> {
    return this.http.post<JwtToken>(
      `${this.config.apiUrl}/session/generatetoken-by-password`,
      data
    );
  }

  createOTP(data) {
    return this.http.post(`${this.config.apiUrl}/user/createotp`, data);
  }

  loginInNormally(data): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/user/signin`, data)
  }

  authenticateOTP(otp): Observable<JwtToken> {
    return this.http.post<JwtToken>(
      `${this.config.apiUrl}/session/generatetoken/${otp}`,
      {}
    );
  }

  registerBuyer(data){
    return this.http.put(`${this.config.apiUrl}/user/complete`, data);
  }

  get getToken(): string {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  public get loggedIn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }

  public userInformation(): Observable<UserInformation> {
    return this.http.get<UserInformation>(
      `${this.config.apiUrl}/user/information`
    );
  }

  public userInfoById(id): Observable<UserInformation> {
    return this.http.get<UserInformation>(`${this.config.apiUrl}/user/information/${id}`);
  }
}

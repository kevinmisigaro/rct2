import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Count, Country, Logs } from '../models/helper.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private REGIONS = [
    {
      name: 'Dar es Salaam',
      shortcode: 'dar es salaam',
    },
    {
      name: 'Lindi',
      shortcode: 'lindi',
    },
    {
      name: 'Arusha',
      shortcode: 'arusha',
    },
    {
      name: 'Geita',
      shortcode: 'geita',
    },
    {
      name: 'Iringa',
      shortcode: 'iringa',
    },
    {
      name: 'Bukoba',
      shortcode: 'bukoba',
    },
    {
      name: 'Kigoma',
      shortcode: 'kigoma',
    },
    {
      name: 'Manyara',
      shortcode: 'manyara',
    },
    {
      name: 'Kilimanjaro',
      shortcode: 'kilimanjaro',
    },
    {
      name: 'Mara',
      shortcode: 'mara',
    },
    {
      name: 'Dodoma',
      shortcode: 'dodoma',
    },
    {
      name: 'Kagera',
      shortcode: 'kagera',
    },
    {
      name: 'Katavi',
      shortcode: 'katavi',
    },
    {
      name: 'Mara',
      shortcode: 'mara',
    },
    {
      name: 'Morogoro',
      shortcode: 'morogoro',
    },
    {
      name: 'Mtwara',
      shortcode: 'mtwara',
    },
    {
      name: 'Mwanza',
      shortcode: 'mwanza',
    },
    {
      name: 'Njombe',
      shortcode: 'njombe',
    },
    {
      name: 'Pwani',
      shortcode: 'pwani',
    },
    {
      name: 'Rukwa',
      shortcode: 'rukwa',
    },
    {
      name: 'Ruvuma',
      shortcode: 'ruvuma',
    },
    {
      name: 'Shinyanga',
      shortcode: 'shinyanga',
    },
    {
      name: 'Simiyu',
      shortcode: 'simiyu',
    },
    {
      name: 'Singida',
      shortcode: 'singida',
    },
    {
      name: 'Songwe',
      shortcode: 'songwe',
    },
    {
      name: 'Tabora',
      shortcode: 'tabora',
    },
    {
      name: 'Tanga',
      shortcode: 'tanga',
    },
    {
      name: 'Unguja',
      shortcode: 'unguja',
    },{
      name: 'Mbeya',
      shortcode: 'mbeya'
    }
  ];

  private languageSubject = new Subject<any>()

  sendNewLanguage(lang: string){
    this.languageSubject.next({language:lang})
  }

  getLanguage(): Observable<any>{
    return this.languageSubject.asObservable()
  }

  toggleLogin: BehaviorSubject<boolean> = new BehaviorSubject(false);
  toggle$ = this.toggleLogin.asObservable();

  constructor(private http: HttpClient, private config: ConfigService) {}

  getCount(): Observable<Count> {
    return this.http.get<Count>(`${this.config.apiUrl}/counter`);
  }

  getRegions() {
    return this.REGIONS;
  }

  getCountries(): Observable<Country> {
    return this.http.get<Country>(`${this.config.apiUrl}/country`);
  }

  addToLogs(data){
    return this.http.post(`${this.config.apiUrl}/logs`, data)
  }

  getAllLogs(): Observable<Logs>{
    return this.http.get<Logs>(`${this.config.apiUrl}/logs/offset/0`);
  }

  getLogsByDate(date){
    return this.http.get(`${this.config.apiUrl}/logs/offset/0/date/${date}`)
  }
}

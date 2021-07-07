import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Messenger, Message, MessagesList } from '../models/helper.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  createChatFromQoute(data){
    return this.http.post(`${this.config.apiUrl}/messenger`, data)
  }

  getMessengerFromQouteId(id): Observable<Messenger>{
    return this.http.get<Messenger>(`${this.config.apiUrl}/messenger/${id}`)
  }

  readMessagesFromQouteId(id): Observable<Message>{
    return this.http.get<Message>(`${this.config.apiUrl}/message/${id}`)
  }

  sendMessage(data){
    return this.http.post(`${this.config.apiUrl}/message/`, data)
  }

  getAllMessagesFromMessenger(): Observable<MessagesList>{
    return this.http.get<MessagesList>(`${this.config.apiUrl}/messenger`);
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { Paho } from 'node_modules/ng2-mqtt/mqttws31';
import * as moment from 'node_modules/moment';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
declare var $: any;

@Component({
  selector: 'app-buyer-chat',
  templateUrl: './buyer-chat.component.html',
  styleUrls: ['./buyer-chat.component.css'],
})
export class BuyerChatComponent implements OnInit, OnDestroy {
  displayChats: boolean = false;
  userId: string;
  qouteId: string;
  sellerId: string;
  sellers = [];
  messages = [];
  messageSent = '';
  sellerName: string;
  sellerImage: any = '';
  private _client: Paho.MQTT.Client;
  en: boolean = false
  languageSubsription: Subscription

  constructor(private auth: AuthService, private chatService: ChatService, private helperService: HelperService) {
    //set MQTT client with requirments
    this._client = new Paho.MQTT.Client(
      'rctapp.co.tz', //host URL
      Number(8083), //port for websocket connection
      Date.now().toString() //set unique client ID
    );

    //do this when connection to client is lost
    this._client.onConnectionLost = (responseObject: Object) => {
      console.log('Connection lost.');
    };

    //handle on message sent
    this._client.onMessageArrived = (message: Paho.MQTT.Message) => {
      console.log('Message arrived.', message.payloadString);

      let messageObj = JSON.parse(message.payloadString);

      if (messageObj.senderId != this.userId) {
        this.messages.push(messageObj);
      }

      console.log(messageObj);

      this.scrollAction();
    };

    this.languageSubsription = this.helperService.getLanguage().subscribe(language => { this.ngOnInit() })
  }

  ngOnDestroy(){
    this.languageSubsription.unsubscribe()
  }

  scrollAction() {
    $(document).ready(function () {
      $('#chats').animate(
        {
          scrollTop: $('#chats').get(0).scrollHeight,
        },
        2000
      );
    });
  }

  private onConnected(): void {
    console.log('Connected to broker.');
    console.log('the qoute id is ', this.qouteId);
    this._client.subscribe(this.qouteId, '');
    this.chatService.readMessagesFromQouteId(this.qouteId).subscribe((res) => {
      this.messages = res.data.sort((a, b) => a.time - b.time);
      //auto scroll
      this.scrollAction();
    });
  }

  ngOnInit(): void {

    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else {
      this.en = false
    }
    
    //get user ID
    this.auth.userInformation().subscribe((res) => {
      this.userId = res.data.user.id;
      console.log('user id is ', this.userId);

      this.chatService.getAllMessagesFromMessenger().subscribe((data) => {
        let mess = data.data.filter(
          (x) => x.messenger_id == this.userId && x.expiration_status == true
        );

        this.sellers = mess
          .map((x) => ({
            qouteID: x.quote_id,
            sellerID: x.seller_id,
            name: x.seller,
            seller_image: x.seller_image_path,
            time: x.updated_time,
            unreadMessages: x.message_count,
          }))
          .sort((a, b) => a.time - b.time);

        console.log(this.sellers);
      });
    });

    //scroll user to top
    window.scrollTo(500, 0);
  }

  userClicked(seller) {
    this.displayChats = true;

    this.qouteId = seller.qouteID;

    this.sellerImage = seller.seller_image;

    if (this.sellerId !== seller.sellerID) {
      this._client.connect({ onSuccess: this.onConnected.bind(this) });
    }

    if (seller.unreadMessages > 0) {
      seller.unreadMessages = 0;
    }

    this.sellerName = seller.name;

    console.log(this.sellerName);

    this.sellerId = seller.sellerID;

    //auto scroll
    this.scrollAction();
  }

  getTime(value) {
    return moment(value).format('MMMM Do YYYY, hh:mm a');
  }

  sendMessage() {
    //if message input is empty; dont do anything
    if (this.messageSent == '' || null) {
      return;
    }

    //save sent message to variable
    let messageToSend = this.messageSent;

    console.log(this.messageSent);

    //save object to send to send message API
    let data = {
      quote_id: this.qouteId,
      sender_id: this.userId,
      receiver_id: this.sellerId,
      message: messageToSend,
    };

    //make sure object has no null values, otherwise dont send message
    if (
      data.quote_id == null ||
      data.sender_id == null ||
      data.receiver_id == null
    ) {
      return (this.messageSent = '');
    }

    //message object to add to messages array so as to display
    let messageObj = {
      qouteId: this.qouteId,
      senderId: this.userId,
      message: messageToSend,
    };

    //add message to array for good UX
    this.messages.push(messageObj);

    //clear message object
    this.messageSent = '';

    this.scrollAction();

    //actually send message
    this.chatService.sendMessage(data).subscribe((res) => {
      console.log('message sent');
    });
  }
}

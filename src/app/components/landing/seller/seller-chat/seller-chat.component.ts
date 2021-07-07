import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { Paho } from 'node_modules/ng2-mqtt/mqttws31';
import * as moment from 'node_modules/moment';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
declare var $: any;

@Component({
  selector: 'app-seller-chat',
  templateUrl: './seller-chat.component.html',
  styleUrls: ['./seller-chat.component.css'],
})
export class SellerChatComponent implements OnInit, OnDestroy {
  displayChats: boolean = false;
  userId: string;
  qouteId: string;
  buyerId: string;
  buyers = [];
  messages = [];
  messageSent = '';
  buyerChosen: boolean = false;
  buyerName: string;
  buyerImage: any = '';
  private _client: Paho.MQTT.Client;
  en: boolean = false
  languageSubsription: Subscription

  constructor(private auth: AuthService, private chatService: ChatService, private helper: HelperService) {
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

    this.languageSubsription = this.helper.getLanguage().subscribe(language => { this.ngOnInit() })
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

  ngOnDestroy():void{
    this.languageSubsription.unsubscribe()
  }

  ngOnInit(): void {

    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else {
      this.en = false
    }

    this.auth.userInformation().subscribe((res) => {
      this.userId = res.data.user.id;

      this.chatService.getAllMessagesFromMessenger().subscribe((data) => {
        let mess = data.data.filter(
          (x) => x.seller_id == this.userId && x.expiration_status == true
        );

        this.buyers = mess.map((x) => ({
          qouteID: x.quote_id,
          buyerID: x.messenger_id,
          name: x.buyer,
          buyer_image: x.buyer_image_path,
          time: x.updated_time,
          unreadMessages: x.message_count,
        }));

        console.log(this.buyers);
      });
    });

    //scroll page to top
    window.scrollTo(500, 0);

    if (this.buyerChosen) {
      this.chatService
        .readMessagesFromQouteId(this.qouteId)
        .subscribe((res) => {
          this.messages = res.data.sort((a, b) => a.time - b.time);

          this.scrollAction();
        });
    }
  }

  getTime(value) {
    return moment(value).format('MMMM Do YYYY, hh:mm a');
  }

  userClicked(buyer) {
    this.buyerChosen = true;
    this.displayChats = true;
    this.qouteId = buyer.qouteID;

    this.buyerImage = buyer.buyer_image;

    //if chosen buyer is new; form new connection
    if (this.buyerId !== buyer.buyerID) {
      this._client.connect({ onSuccess: this.onConnected.bind(this) });
    }

    if (buyer.unreadMessages > 0) {
      buyer.unreadMessages = 0;
    }

    this.buyerName = buyer.name;

    this.buyerId = buyer.buyerID;

    //auto scroll
    this.scrollAction();
  }

  sendMessage() {
    //dont send message if input is null
    if (this.messageSent == '' || null) {
      return;
    }

    //save sent message to variable
    let messageToSend = this.messageSent;

    //check data object
    let data = {
      quote_id: this.qouteId,
      sender_id: this.userId,
      receiver_id: this.buyerId,
      message: messageToSend,
    };

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

    //send message to DB
    this.chatService.sendMessage(data).subscribe((res) => {
      //clear message input
      console.log('message sent');
    });
  }
}

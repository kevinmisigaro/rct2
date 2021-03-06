import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
import * as moment from 'moment';
declare var $: any;
import * as firebase from 'firebase';
import { DatabaseReference } from '@angular/fire/database/interfaces';

@Component({
  selector: 'app-buyer-firebase-chat',
  templateUrl: './buyer-firebase-chat.component.html',
  styleUrls: ['./buyer-firebase-chat.component.css'],
})
export class BuyerFirebaseChatComponent implements OnInit, OnDestroy {
  sellers = [];
  en: boolean = false;
  languageSubsription: Subscription;
  userId: string = null;
  qouteId: string = null;
  sellerId: string = null;
  messages = [];
  messageSent = '';
  sellerName: string;
  sellerImage: any = '';
  displayChats: boolean = false;
  firebaseChatRef: DatabaseReference;

  constructor(
    private afDB: AngularFireDatabase,
    private helperService: HelperService,
  ) {
    this.languageSubsription = this.helperService
      .getLanguage()
      .subscribe((language) => {
        this.ngOnInit();
      });
  }

  ngOnInit(): void {
    if (localStorage.getItem('lang') === 'en') {
      this.en = true;
    } else {
      this.en = false;
    }

    this.userId = localStorage.getItem('id');

    this.afDB
      .list(`messenger/${this.userId}`)
      .valueChanges()
      .subscribe((items: any) => {
        items.forEach((x: any) => {
          var dateToTest = moment(x.update_time);
          var currDate = moment();
          if (currDate.isSameOrAfter(dateToTest.add(1, 'week'))) {
            this.afDB.list(`messenger/${this.userId}`).update(`${x.quote_id}`, {
              ...x,
              chat_status: false,
              expiration_status: true,
            });
          }
        });

        let messengers: [] = items.filter((x) => x.chat_status === true);

        this.sellers = messengers.map((x: any) => ({
          qouteID: x.quote_id,
          sellerID: x.seller_id,
          name: x.seller,
          seller_image: x.seller_image_path,
          unreadMessages: 0,
        }));

        console.log(this.sellers);
      });
  }

  scrollAction() {
    $(document).ready(function () {
      $('#chats').animate(
        {
          scrollTop: $('#chats').get(0).scrollHeight,
        },
        1000
      );
    });
  }

  // what to do when seller is clicked
  userClicked(seller) {
    console.log('the seller is ', seller);
    this.displayChats = true;

    this.sellerImage = seller.seller_image;

    if (this.qouteId != seller.qouteID) {
      console.log('quote id is different');
      this.messages = [];

      if (this.qouteId != null) {
        this.firebaseChatRef.off();
        console.log('listener closed');
      }

      //set new quoteID
      this.qouteId = seller.qouteID;

      this.firebaseChatRef = firebase.default
        .database()
        .ref(`chats/${this.userId}/${this.qouteId}/`);

      this.afDB
        .list(`chats/${this.userId}/${this.qouteId}`)
        .stateChanges(['child_added'])
        .subscribe((data) => {
          console.log(data.payload.val());
          this.messages.push(data.payload.val());
          if (data.payload.val()) {
            this.scrollAction();
          }
        });
    }

    if (seller.unreadMessages > 0) {
      seller.unreadMessages = 0;
    }

    this.sellerName = seller.name;

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

    //message object to add to messages array so as to display
    let messageObjForSender = {
      message: messageToSend,
      quote_id: this.qouteId,
      sender_id: this.userId,
      receiver_id: this.sellerId,
      time: moment().valueOf(),
      readStatus: true,
    };

    let messageObjForReciever = {
      message: messageToSend,
      quote_id: this.qouteId,
      sender_id: this.userId,
      receiver_id: this.sellerId,
      time: moment().valueOf(),
      readStatus: false,
    };

    this.afDB
      .list(`chats/${this.userId}/${this.qouteId}`)
      .push(messageObjForSender)
      .then(() => {
        this.afDB
          .list(`chats/${this.sellerId}/${this.qouteId}`)
          .push(messageObjForReciever);
      });

    //clear message object
    this.messageSent = '';

    this.scrollAction();
  }

  ngOnDestroy() {
    this.languageSubsription.unsubscribe();
    this.afDB
    .list(`chats/${this.userId}/${this.qouteId}`)
    .stateChanges(['child_added'])
    .subscribe().unsubscribe()
    this.afDB
      .list(`messenger/${this.userId}`)
      .valueChanges()
      .subscribe()
      .unsubscribe();
  }
}

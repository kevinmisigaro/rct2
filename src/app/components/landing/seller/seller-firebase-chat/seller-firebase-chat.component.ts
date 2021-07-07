import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
import * as moment from 'moment';
import * as firebase from 'firebase';

@Component({
  selector: 'app-seller-firebase-chat',
  templateUrl: './seller-firebase-chat.component.html',
  styleUrls: ['./seller-firebase-chat.component.css'],
})
export class SellerFirebaseChatComponent implements OnInit, OnDestroy {
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
  en: boolean = false;
  languageSubsription: Subscription;

  constructor(
    private helper: HelperService,
    private afDB: AngularFireDatabase
  ) {
    this.languageSubsription = this.helper
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
            this.afDB
              .list(`messenger/${this.userId}`)
              .update(`${x.quote_id}`, {
                ...x,
                chat_status: false,
                expiration_status: true,
              });
          }
        });

        let messengers: [] = items.filter((x) =>  x.chat_status === true);

        this.buyers = messengers.map((x: any) => ({
          qouteID: x.quote_id,
          buyerID: x.messenger_id,
          name: x.buyer,
          buyer_image: x.buyer_image_path,
          unreadMessages: 0,
        }));

        console.log(this.buyers);
      });

    this.scrollAction();
  }

  getTime(value) {
    return moment(value).format('MMMM Do YYYY, hh:mm a');
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

  userClicked(buyer) {
    this.buyerChosen = true;
    this.displayChats = true;

    this.buyerImage = buyer.buyer_image;

    if (this.buyerId !== buyer.buyerID) {
      //when its a new buyer clicked, unsubscribe from current convo if tracked.
      if (this.qouteId != null) {
        firebase.default.database().ref(`chats/${this.userId}/${this.qouteId}`).off();
      }

      //set new qouteID
      this.qouteId = buyer.qouteID;

      //subscribe to new conversation
      firebase.default
        .database()
        .ref(`chats/${this.userId}/${this.qouteId}`)
        .on('child_added', (data) => {
          this.messages.push(data.val());
        });
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
    //if message input is empty; dont do anything
    if (this.messageSent == '' || null) {
      return;
    }

    //save sent message to variable
    let messageToSend = this.messageSent;

    //message object to add to messages array so as to display
    let messageObj = {
      quote_id: this.qouteId,
      sender_id: this.userId,
      message: messageToSend,
      receiver_id: this.buyerId,
      time: moment().valueOf()
    };

    //add message to array for good UX
    // this.messages.push(messageObj);
    this.afDB.list(`chats/${this.userId}/${this.qouteId}`).push(messageObj).then(() => {
      this.afDB.list(`chats/${this.buyerId}/${this.qouteId}`).push(messageObj)
    });
    //clear message object
    this.messageSent = '';

    this.scrollAction();
  }

  ngOnDestroy() {
    this.languageSubsription.unsubscribe();
    firebase.default.database().ref(`chats/${this.userId}/${this.qouteId}`).off();
    this.afDB.list(`messenger/${this.userId}`).valueChanges().subscribe().unsubscribe();
  }
}

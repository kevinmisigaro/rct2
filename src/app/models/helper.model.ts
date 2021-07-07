export class Count {
  'data': {
    platform: number;
    seller: number;
    tender_request: number;
    tender_given: number;
    buyer: number;
  };
}

export class Country {
  'data': [
    {
      code: string;
      country_name: string;
      dial_code: string;
      currency_name: string;
      currency_symbol: string;
      currency_code: string;
    }
  ];
}

export class Messenger {
  data: {
    messengerId: string;
    messenger_id: string;
    seller_id: string;
    quote_id: string;
    chat_status: boolean;
    expiration_status: boolean;
    message_count: number;
  };
}

export class Message {
  data: [
    {
      id: string;
      messengerId: string;
      senderId: string;
      receiverId: string;
      message: string;
      time: number;
      readStatus: boolean;
    }
  ];
}

export class Logs {
  data: {
    logs: [
      {
        id: string;
        action: string;
        performer: string;
        role: string;
        time: string;
      }
    ];
    item_count: number;
  };
}

export class MessagesList {
  data: [
    {
      messengerId: string,
      buyer: string,
      seller: string,
      messenger_id: string,
      seller_id: string,
      quote_id: string,
      chat_status: boolean,
      expiration_status: boolean,
      message_count: number,
      buyer_image_path: string,
      seller_image_path: string,
      updated_time: number,
    }
  ]
}

export class Buyer {
    "data": [
        {
            id: string;
            name: string;
            createdTime: Date;
            updatedTime: Date;
            deletedTime: Date;
            password: string;
            salt: string;
            role: string;
            active: string;
            active_status: boolean
            countryName: string;
            dial_code: string;
            phone_number: string;
            image: string;
        },
    ]
}

export class QoutesFromSellers{
    data: [
        {
            id: string;
            active: number;
            tender_id: string;
            seller_id: string;
            supply_quantity: number;
            supply_price: number;
            supply_details: string;
        }
    ]
}

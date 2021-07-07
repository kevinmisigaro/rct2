export class Tender {
    "data": {
        "requestTenderList": [
            {
                id: string;
                quantity: number;
                grade: number;
                active: number;
                variety: string;
                graded: boolean;
                batchCertified: boolean;
                selling_price: number;
                is_graded: boolean;
                is_batch_certified: boolean;
                pickup_location:  string;
                extra_details: string;
                buyer_sellection: string;
                image_string: string;
                document_string: string;
                id_string: string;
                request_document: string;
                request_card: string;
                product_images_list: []
            }
        ],
        item_count: number
    }
}

export class TenderGiven {
    id: string;
    quantity: number;
    grade: number;
    variety: string;
    active: string;
    buyer_id: string;
    description: string;
    seller_selection: string;
    created_time: Date
}

export class TenderRequestFromSeller{
    data: [
        {
            id: string;
            quantity: number;
            grade: number;
            active: number;
            variety: string;
            graded: boolean
            batchCertified: boolean
            selling_price: number;
            is_graded: boolean;
            is_batch_certified: boolean;
            pickup_location: string;
            extra_details: string;
            buyer_sellection: null;
            image_string: string;
            document_string: string;
            id_string: string;
            request_document: string;
            request_card: string;
            product_images_list: []
        }
    ]
}
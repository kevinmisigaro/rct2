export class Seller {
    data: {
        sellerInformations: [
            {
                id: string;
                category: string;
                full_name: string;
                dial_code: string;
                phone_number: string;
                platform_name: string;
                platform_leader: string;
                location: string;
                card_type: string;
                application_type: string;
                district: string;
                is_graded: number;
                is_tbs_certified: string;
                image_path: string;
                certificate_path: string;
                card_path: string;
            },
        ],
        item_count: number
    }
}

export class SingleSeller {
    data: {
        id: string;
        category: string;
        full_name: string;
        dial_code: string;
        phone_number: string;
        district: string;
        platform_name: string;
        platform_leader: string;
        location: string;
        card_type: string;
        application_type: string;
        is_graded: number;
        is_tbs_certified: string;
        image_path: string;
        certificate_path: string;
        card_path: string;
    }
}

export class VarietySeller {
    data: [
        {
            id: string;
            category: string;
            full_name: string;
            dial_code: string;
            phone_number: string;
            platform_name: string;
            platform_leader: string;
            location: string;
            card_type: string;
            application_type: string;
            district: string;
            is_graded: number;
            is_tbs_certified: string;
            image_path: string;
            certificate_path: string;
            card_path: string;
        }
    ]
}

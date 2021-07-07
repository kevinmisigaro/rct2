export class Platform {
    "data": {
        "platform": [
            {
                id: string;
                active: number;
                country: string;
                platform_name: string;
                platform_country_dial_code: string;
                phone_number: string;
                platform_region: string;
                number_of_members: number;
                leader_name: string;
                image_path: string;
            },
        ]
    }
}

export class CreatePlatformToken{
    data: string;
}

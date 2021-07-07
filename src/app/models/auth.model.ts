export class Auth {
}

export class JwtToken {
    data: {
        token: string;
        refreshToken: string;
    }
}


export class UserInformation{
    "data": {
        "user": {
            id: string;
            name: string;
            active: number
            dial_code: string;
            phone_number: string;
        },
        "roles": [
            {
                id: string;
                role: string;
                active: number;
                user_id: string;
            }
        ],
        profile_image_path: string;
    }
}

export class Role {
    id: string;
    role: string;
    active: number;
    user_id: string; 
}
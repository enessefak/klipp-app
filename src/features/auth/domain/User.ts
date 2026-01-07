export interface UserProfile {
    id: string;
    name: string;
    email: string;
    taxNumber?: string | null;
    taxOffice?: string | null;
    address?: string | null;
    city?: string | null;
    subdivision?: string | null;
    phone?: string | null;
}

export type UpdateUserProfileInput = Partial<Pick<UserProfile,
    'name' |
    'taxNumber' |
    'taxOffice' |
    'address' |
    'city' |
    'subdivision' |
    'phone'
>>;

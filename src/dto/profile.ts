export interface ProfileDto {
    id: number;
    firstName: string;
    lastName: string;
    profession: string;
    balance: number;
    type: 'client' | 'contractor';
}
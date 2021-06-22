
export interface JobDto {
    id?:number;
    price: number;
    paid: boolean;
    paymentDate: Date;
    description: string;
}

export interface JobPayment {
    amount: number;
    paymentDate: Date;
}
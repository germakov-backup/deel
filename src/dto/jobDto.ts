import { ContractInfo } from "./contractDto";

export interface JobDto {
    id?:number;
    price: number;
    paid: boolean;
    paymentDate: Date;
    description: string;
    contract: ContractInfo;
}

export interface JobPayment {
    amount: number;    
}
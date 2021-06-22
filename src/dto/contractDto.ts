import {ProfileDto} from "./profileDto";

export interface ContractInfo {
    id: number;    
    status: 'new' | 'in_progress' | 'terminated'    
}

export interface ContractDetails extends ContractInfo {
    client: ProfileDto;
    contractor: ProfileDto;
}
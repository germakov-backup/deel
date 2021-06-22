import {Contract, Job, Profile} from '../model'
import {ClientReportItem} from "../dto/clientReportDto";
import {ContractDetails, ContractInfo} from "../dto/contractDto";
import {ProfileDto} from "../dto/profileDto";
import {JobDto} from "../dto/jobDto";

export default class MappingService {
    static mapClientReport(profile: Profile, paidAmount: number) : ClientReportItem {
        return {
            id: profile.id,
            fullName: `${profile.firstName} ${profile.lastName}`,
            paid: paidAmount
        };
    } 
    
    static mapContractDetails(contract: Contract) : ContractDetails  {
        return  {            
            client: this.mapProfileDto(contract.Client),
            contractor: this.mapProfileDto(contract.Contractor),
            ...this.mapContractInfo(contract)
        }
    }
    
    static mapContractInfo(contract: Contract): ContractInfo {
        return  {
            id: contract.id,
            status: contract.status
        }
    }
    
    static mapProfileDto(profile: Profile) : ProfileDto {

        return {
            id: profile.id,
            balance: profile.balance,
            firstName: profile.firstName,
            lastName: profile.lastName,
            type: profile.type,
            profession: profile.profession
        };
    }

    static mapJobDto(job: Job) : JobDto {
        return {
            id: job.id,
            contract: this.mapContractInfo(job.Contract),
            paid: !!job.paid,
            description: job.description,
            paymentDate: job.paymentDate,
            price: job.price
        };
    }
}
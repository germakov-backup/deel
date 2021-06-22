import {Contract, Profile} from '../model';
import { Op } from 'sequelize';
import CustomError from "../customError";
import {ContractDetails} from "../dto/contractDto";
import mappingService from "./mappings"; 

export default class ContractService
{
    static async getProfileContracts(profileId): Promise<ContractDetails[]> {        
        const contracts = await Contract.findAll({
            where: {
                status: {
                    [Op.ne] : 'terminated'
                },
                [Op.or]: [
                    {
                        '$Client.id$': { 
                            [Op.eq]: profileId
                        }
                    }, {
                        '$Contractor.id$' : {
                            [Op.eq]: profileId
                        }
                    }
                ]
            },
            include: [{
                model: Profile,
                as: 'Client',
                required: false
            }, {
                model: Profile,
                as: 'Contractor',
                required: false
            }]
        });
        
        return contracts.map(c => mappingService.mapContractDetails(c));
    }

    static async getProfileContract(contractId, profileId) : Promise<ContractDetails>
    {   
        const contract = await Contract.findOne({
            where: {
                id: contractId
            },
            include: [{
                model: Profile,
                as: 'Client',
                required: false                               
            }, {
                model: Profile,
                as: 'Contractor',
                required: false                
            }]
        });
        
        if (!contract) {
            throw new CustomError('NotFound', "Profile not found");
        }
        
        if ((contract.Client?.id !== profileId && contract.Contractor?.id !== profileId)) {
            throw new CustomError('Validation', "Invalid profile access");
        }
        
        return mappingService.mapContractDetails(contract);
    }
}
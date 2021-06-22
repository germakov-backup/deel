import {Contract, Profile} from '../model';
import { Op } from 'sequelize';
import CustomError from "../customError"; 

export default class ContractService
{
    static async getProfileContracts(profileId) {        
        const contracts = Contract.findAll({
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
        
        return contracts;
    }

    static async getProfileContract(contractId, profileId)
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
        
        return contract;
    }
}
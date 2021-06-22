const models = require('../model');
const { Op } = require('sequelize') 

module.exports = class ContractService
{
    static async getProfileContracts(profileId) {
        const {Contract, Profile} = models;
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
        const {Contract, Profile} = models;
        
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
                        
        if (!contract || (contract.Client?.id !== profileId && contract.Contractor?.id !== profileId)) {
            return null;
        }
        
        return contract;
    }
}
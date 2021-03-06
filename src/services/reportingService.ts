import {Profile, Contract, Job, sequelize} from "../model";
import {Op} from "sequelize";
import CustomError from "../customError";
import {ClientReportItem} from "../dto/clientReportDto";
import mappingService from "./mappings";

type JobsTotalQuery = {
    getDataValue(field: 'totalJobsPrice') : number;
};

export default class ReportingService {
    
    static async findBestEarningProfession(start: Date, end: Date): Promise<string> {
                
        const profileWithMostPaidJob: Profile & JobsTotalQuery = await Profile.findOne({            
            attributes: {
                include: [[sequelize.fn('Sum', sequelize.col('Contractor.Jobs.price')), 'totalJobsPrice']]
            },            
            include: [{
                model: Contract,                
                required: true,
                as: 'Contractor',
                include: [{
                    model: Job,                    
                    required: true,
                    where: {
                        paymentDate: { [Op.between] : [start, end] },
                        paid: { [Op.eq] : 1 }
                    }
                }]
            }],
            group: 'Profile.id',
            order: [[sequelize.col('totalJobsPrice'), "DESC"]],
            subQuery: false,
        });               
        
        if (!profileWithMostPaidJob) {
            throw new CustomError('NotFound', "Profession not found");
        }
        
        return profileWithMostPaidJob.profession;
    }

    static async findBestClients(start: Date, end: Date, limit: number): Promise<ClientReportItem[]> {
        const bestPayingClients: Array<Profile & JobsTotalQuery> = await Profile.findAll({
            attributes: {
                include: [[sequelize.fn('Sum', sequelize.col('Client.Jobs.price')), 'totalJobsPrice']]
            },
            limit: limit,
            include: [{
                model: Contract,
                required: true,
                as: 'Client',
                include: [{
                    model: Job,
                    required: true,
                    where: {
                        paymentDate: { [Op.between] : [start, end] },
                        paid: { [Op.eq] : 1 }
                    }
                }]
            }],
            group: 'Profile.id',
            order: [[sequelize.col('totalJobsPrice'), "DESC"]],
            subQuery: false,
        });
        
        return bestPayingClients.map(c => mappingService.mapClientReport(c, c.getDataValue('totalJobsPrice')));
    }
}
import { Profile, Contract, Job } from '../model';
import { Op } from 'sequelize';
import {JobDto} from "../dto/jobDto";
import mappingService from "./mappings";

export default class JobsService {    
    static async getUnpaidJobs(profileId) : Promise<JobDto[]> {
               
        const jobs = await Job.findAll({
            where: {
                paid: { [Op.is] : null },
                '$Contract.status$': { [Op.eq]: 'in_progress'},
                [Op.or]: [
                    { '$Contract.Client.id$': { [Op.eq]: profileId } },  
                    { '$Contract.Contractor.id$': { [Op.eq]: profileId } }
                ]
            },
            include: [
                {
                    model: Contract,
                    required: true,
                    include: [{
                        model: Profile,
                        required: false,
                        as: 'Client'
                    },
                    {
                        model: Profile,
                        required: false,
                        as: 'Contractor'
                    }]
                }
            ]
        });
                
        return jobs.map(j => mappingService.mapJobDto(j));
    }
}
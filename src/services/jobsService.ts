import { Profile, Contract, Job } from '../model';
import { Op } from 'sequelize';

export default class JobsService {    
    static async getUnpaidJobs(profileId) {
               
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
        
        console.log(jobs.map(j => j.toJSON()));
        return jobs;
    }
}
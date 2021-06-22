const models = require('../model');
const { Op } = require('sequelize')

module.exports = class JobsService {
    
    static async getUnpaidJobs(profileId) {
        const { Profile, Contract, Job } = models;
        
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
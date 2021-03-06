import {JobPayment} from "../dto/jobDto";
import {Job, Profile, Contract, sequelize} from '../model';
import {Op, Transaction} from "sequelize";
import CustomError from "../customError";

type JobsTotalQuery = {
    getDataValue(field: 'totalJobsPrice') : number;
};

const jobDepositThresholdRatio = 0.25;

export default class BalanceService {
    static async payJob(clientId: number, jobId: number, payment: JobPayment) : Promise<void> {
        return  await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        }, async (t) => {
            const job = await Job.findByPk(jobId,{
                lock: true,
                include: {
                    model: Contract,
                    include: [{
                        model: Profile,
                        as: 'Client',
                        required: true,
                        where: {
                            id: { [Op.eq] : clientId }
                        }
                    },{
                        model: Profile,
                        as: 'Contractor',
                        required: true                        
                    }]
                }
            }, t);
            
            if (!job || !job.Contract || !job.Contract.Client || !job.Contract.Contractor) {
                throw new CustomError('NotFound', "Job details not found");
            }
            
            if (job.Contract.Client.balance < payment.amount) {
                throw new CustomError('Validation', "Insufficient balance")
            }
            
            if (job.price > payment.amount) {
                // I'd rather add additional column for payed amount. But assume data model is part of the task,
                // so assuming keeping job price for historical data would be more important then subtracting payment from price   
                throw new CustomError('Validation', "Incomplete payments not allowed");
            }
            
            job.paid = true;            
            job.paymentDate = new Date();
            job.Contract.Client.balance -= payment.amount;
            job.Contract.Contractor.balance += payment.amount;
            
            await job.save();
            await job.Contract.Client.save();
            await job.Contract.Contractor.save();
        });
    }
    
    static async deposit(userId: number, amount: number): Promise<void> {
        return  await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        }, async (t) => {
            const profileWithJobsTotal: Profile & JobsTotalQuery = await Profile.findByPk(userId, {
                attributes: {
                    include: [[sequelize.fn('Sum', sequelize.col('Client.Jobs.price')), 'totalJobsPrice']]
                },
                include: {                    
                    model: Contract,
                    required: true,
                    as: 'Client',
                    include: {
                        model: Job,
                        required: false,
                        where: {
                            paid: {
                                [Op.or]: [
                                    {[Op.is]: null},
                                    {[Op.eq]: 0}
                                ],
                            }
                        }
                    }
                },
                group: [['Profile.id'] ]
            }, t);
            
            if (!profileWithJobsTotal) {
                throw new CustomError('NotFound', "Client not found");
            }
            
            const threshold = profileWithJobsTotal.getDataValue('totalJobsPrice') * (jobDepositThresholdRatio * 100) / 100; 
            if (amount > threshold) {
                throw new CustomError('Validation', "Payment amount exceeds unpaid jobs balance threshold");
            }
            
            const profile = Profile.build({ id: userId});
            await profile.increment('balance', { 
                by: amount,
                transaction: t
            });            
        });
    }
}
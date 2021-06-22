import {JobPayment} from "../dto/jobDto";
import {Job, Profile, Contract, sequelize} from '../model';
import {Op, Transaction} from "sequelize";
import CustomError from "../customError";

type JobsTotalQuery = {
    getDataValue(field: 'totalJobsPrice') : number;
};

const jobDepositThresholdRatio = 0.25;

export default class BalanceService {
    static async payJob(clientId: number, jobId: number, payment: JobPayment) : Promise<boolean> {
        return  await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        }, async (t) => {
            const job = await Job.findByPk(jobId,{
                lock: true,
                include: {
                    model: Contract,
                    include: {
                        model: Profile,
                        as: 'Client',
                        where: {
                            id: { [Op.eq] : clientId }
                        }
                    }
                }
            }, t);
            
            if (!job || !job.Contract || !job.Contract.Client) {
                throw new CustomError('NotFound', "Job details not found");
            }
            
            if (job.Contract.Client.balance < payment.amount) {
                throw new CustomError('Validation', "Insufficient balance")
            }
            
            job.paid = job.price <= payment.amount;
            job.price -= payment.amount;
            job.Contract.Client.balance -= payment.amount;
            
            await job.save();
            await job.Contract.Client.save();
        });
    }
    
    static async deposit(userId: number, amount: number) {
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
                        required: true
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
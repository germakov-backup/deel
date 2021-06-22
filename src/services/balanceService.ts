import {JobPayment} from "../dto/jobDto";
import {Job, Profile, Contract, sequelize} from '../model';
import {Op, Transaction} from "sequelize";
import CustomError from "../customError";

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
}
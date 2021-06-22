import {Router, Response} from 'express';
import jobsService from '../services/jobsService';
import balanceService from "../services/balanceService";
import {AuthenticatedRequest} from "../types";
import {JobPayment} from "../dto/jobDto";

type PayParam = {
    id: number
};

const router = Router();
router.get('/unpaid', async (req: AuthenticatedRequest, res: Response, next) => {
    const profileId = req.profile.id;
    const jobs = await jobsService.getUnpaidJobs(profileId).catch(next);
    
    return res.json(jobs);
});

router.post('/:id/pay',  async (req: AuthenticatedRequest<PayParam, {}, JobPayment>, res: Response, next) => {    
    await balanceService.payJob(req.profile.id, req.params.id, req.body).catch(next);
    
    return res.sendStatus(200);
});

export default router;
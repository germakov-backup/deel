import {Router, Response} from 'express';
import jobsService from '../services/jobsService';
import balanceService from "../services/balanceService";
import {AuthenticatedRequest} from "../types";
import {JobPayment} from "../dto/jobDto";
import {withErrorHandling} from "./utils";

type PayParam = {
    id: string
};

const router = Router();
router.get('/unpaid', (req: AuthenticatedRequest, res: Response, next) => {

    return withErrorHandling( async () => {
        const profileId = req.profile.id;
        const jobs = await jobsService.getUnpaidJobs(profileId).catch(next);

        return res.json(jobs);
    }, next);
});

router.post('/:id/pay',  (req: AuthenticatedRequest<PayParam, {}, JobPayment>, res: Response, next) => {
    return withErrorHandling( async () => {
        await balanceService.payJob(req.profile.id, +req.params.id, req.body).catch(next);

        return res.sendStatus(200);
    }, next);
});

export default router;
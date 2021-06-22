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

// didn't quite understood what's meant by 'either a client or contractor'.  
// assumed that api specification is part of the requirements and i'm not able to add new parameters.
router.get('/unpaid', (req: AuthenticatedRequest, res: Response, next) => {

    return withErrorHandling( async () => {
        const profileId = req.profile.id;
        const jobs = await jobsService.getUnpaidJobs(profileId);

        return res.json(jobs);
    }, next);
});

router.post('/:id/pay',  (req: AuthenticatedRequest<PayParam, {}, JobPayment>, res: Response, next) => {
    return withErrorHandling( async () => {
        await balanceService.payJob(req.profile.id, +req.params.id, req.body);
        return res.sendStatus(200);
    }, next);
});

export default router;
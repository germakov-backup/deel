import {Router, Request, Response, NextFunction} from 'express';
import balanceService from "../services/balanceService";
import {AuthenticatedRequest} from "../types";
import CustomError from "../customError";
import exp from "constants";
import {withErrorHandling} from "./utils";

const router = Router();

type DepositParams = {
    userId: string;
}

type DepositRequestBody =  {
    amount: number;
};

// Here api intention is a little bit unclear from the task for me. I assume whole API surface should be authenticated,
// since other endpoints(like jobs unpaid) Implicitly assume "current client".
// So if user is authenticated, goal is to let client deposit on his own balance or to arbitrary client?
// My assumption - is that client should deposit to his balance, userId is redundant
router.post('/deposit/:userId', (req: AuthenticatedRequest<DepositParams, {}, DepositRequestBody>, res: Response, next: NextFunction) => {
    
    if (+req.params.userId !== req.profile.id) {
        return next(new CustomError('Validation', "Deposits to other clients are not supported"));
    }

    return withErrorHandling( async () => {
        await balanceService.deposit(req.profile.id, req.body.amount);
        return res.sendStatus(200);
    }, next);   
});

export default router;
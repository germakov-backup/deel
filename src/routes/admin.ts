import {Router, Request, Response, NextFunction} from "express";
import {Profile, Contract} from "../model";
import {withErrorHandling} from "./utils";
import reportingService from "../services/reportingService";
import CustomError from "../customError";

const router = Router();

const DEFAULT_CLIENTS_LIMIT = 2;

type ProfessionQueryParams = {
    start: Date,
    end: Date
}; 

type ClientsQueryParams = ProfessionQueryParams & {
    limit?:number;
}

router.get("/best-profession", (req: Request<{}, string, {}, ProfessionQueryParams>, res: Response, next: NextFunction) => {
    return withErrorHandling( async () => {
        const start = new Date(req.query.start);
        const end = new Date(req.query.end);
        validateRange(start, end);
        
        const profession = await reportingService.findBestEarningProfession(start, end);
        return res.status(200).send(profession);
    }, next);
});

router.get('/best-clients', (req: Request<{}, string, {}, ClientsQueryParams>, res: Response, next: NextFunction) => {
    return withErrorHandling( async () => {
        const start = new Date(req.query.start);
        const end = new Date(req.query.end);
        validateRange(start, end);
        
        const profession = await reportingService.findBestClients(start, end, req.query.limit || DEFAULT_CLIENTS_LIMIT);
        return res.status(200).send(profession);
    }, next);
});

function validateRange(start, end) {
    if (!start || !end || start > end) {
        throw new CustomError('Validation', "Invalid request range");
    }
}

export default router;
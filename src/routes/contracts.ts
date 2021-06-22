import { Router } from 'express'
import contractService from '../services/contractService'
import {AuthenticatedRequest} from "../types";
import {withErrorHandling} from "./utils";
import balanceService from "../services/balanceService";

const router = Router();
type ContractByIdParams = { id : string };
/**
 * @returns contract by id
 */
router.get('/:id', async (req: AuthenticatedRequest<ContractByIdParams>, res, next) =>{

    return withErrorHandling( async () => {
        const { id : contractId} = req.params;
        const profileId = req.profile.id;

        const contract = await contractService.getProfileContract(+contractId, profileId).catch(next);
        res.json(contract).send();
    }, next);
});

router.get('/', async (req: AuthenticatedRequest, res, next) => {
    return withErrorHandling( async () => {
        const profileId = req.profile.id;
        const contracts =  await contractService.getProfileContracts(profileId).catch(next);

        res.json(contracts || []);
    }, next);
});

export default router;
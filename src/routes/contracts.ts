import { Router } from 'express'
import contractService from '../services/contractService'
import {AuthenticatedRequest} from "../types";

const router = Router();
/**
 * @returns contract by id
 */
router.get('/:id', async (req: AuthenticatedRequest, res, next) =>{
    const { id : contractId} = req.params;
    const profileId = req.profile.id;    
    
    const contract = await contractService.getProfileContract(contractId, profileId).catch(next);
    res.json(contract).send();
});

router.get('/', async (req: AuthenticatedRequest, res, next) => {
    const profileId = req.profile.id;
    const contracts =  await contractService.getProfileContracts(profileId).catch(next);
    
    res.json(contracts || []);
});

export default router;
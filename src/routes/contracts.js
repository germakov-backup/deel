const {Sequelize} = require("sequelize");
const router = require('express').Router();
const contractService = require('../services/contractService')

/**
 * @returns contract by id
 */
router.get('/:id', async (req, res) =>{
    const { id : contractId} = req.params;
    const profileId = req.profile.id;    
    
    const contract = await contractService.getProfileContract(contractId, profileId);
    if(!contract) {
        return res.status(404).end();
    }
    
    res.json(contract).send();
});

router.get('/', async (req, res) => {
    const profileId = req.profile.id;
    const contracts =  await contractService.getProfileContracts(profileId);
    
    res.json(contracts || []);
});

module.exports = router;
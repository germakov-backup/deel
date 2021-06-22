const router = require('express').Router();
const jobsService = require('../services/jobsService');

router.get('/unpaid', async (req, res) => {
    const profileId = req.profile.id;
    const jobs = await jobsService.getUnpaidJobs(profileId);
    
    return res.json(jobs);
});

module.exports = router;
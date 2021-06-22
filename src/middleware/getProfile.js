const profileService = require('../services/profileService');

const getProfile = async (req, res, next) => {
    const id = req.get('profile_id');
    const profile = await profileService.findById(id);
    
    if(!profile) {
        return res.status(401).end();
    }
    
    req.profile = profile;
    next()
}

module.exports = {getProfile}
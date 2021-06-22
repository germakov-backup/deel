const models = require('../model')

module.exports = class ProfileService {
    static async findById(profileId) {
        const {Profile} = models;
        if (!profileId) {
            return null;
        }

        return await Profile.findOne({
            where: {
                id: profileId
            }
        });
    }
}
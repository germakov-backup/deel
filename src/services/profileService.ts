import {Profile} from '../model'
import CustomError from "../customError";

export default class ProfileService {
    static async findById(profileId) {        
        if (!profileId) {
            throw new CustomError('Validation', 'Invalid profile Id');
        }

        const profile = await Profile.findOne({
            where: {
                id: profileId
            }
        });
        
        if (!profile) {
            throw new CustomError('NotFound', 'Profile not found')
        }
        
        return profile;
    }
}
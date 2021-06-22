import {Profile} from '../model'
import CustomError from "../customError";

export default class ProfileService {
    static async findById(profileId) {        
        if (!profileId) {
            throw new CustomError('Validation', 'Invalid profile Id');
        }

        return await Profile.findOne({
            where: {
                id: profileId
            }
        });
    }
}
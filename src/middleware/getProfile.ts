import profileService from '../services/profileService';
import {Response} from 'express';
import {AppHeaders, AuthenticatedRequest} from "../types";
import CustomError from "../customError";

export const getProfile = async (req: AuthenticatedRequest, res: Response, next) => {
    const id = req.get('profile_id');
    const profile = await profileService.findById(id).catch(next);
    
    if(!profile) {
        next(new CustomError('NotFound', 'Profile not found'));
    }
    
    req.profile = profile;
    next();
}
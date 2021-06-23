import profileService from '../services/profileService';
import {Response} from 'express';
import {AuthenticatedRequest} from "../types";
import CustomError from "../customError";

export const getProfile = async (req: AuthenticatedRequest, res: Response, next) => {
    const id = req.get('profile_id');
    try {
        req.profile = await profileService.findById(id);
        next();
    }
    catch (e) {
        if (e instanceof CustomError && e.code === 'NotFound') {
            return res.status(401).end();            
        }
        
        next(e);
    }
}
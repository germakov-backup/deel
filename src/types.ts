import {Request} from 'express';
import * as core from "express-serve-static-core";
import {ProfileDto} from "./dto/profileDto";

export type AppHeaders = 'profile_id';

export interface AuthenticatedRequest<
        P = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = core.Query,
        Locals extends Record<string, any> = Record<string, any>>
    extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    profile: ProfileDto;    
    get: ((header: AppHeaders) =>  string | undefined) & Request['get'];
} 
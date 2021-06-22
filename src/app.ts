import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { getProfile } from './middleware/getProfile';

import contractsRouter from './routes/contracts';
import jobsRouter from './routes/jobs';
import CustomError from "./customError";

const app = express();
app.use(bodyParser.json());


app.use(getProfile);
app.use('/contracts', contractsRouter);
app.use('/jobs', jobsRouter);

app.use((err, req: Request, res: Response, next) => {
    if (err instanceof  CustomError) {
        if (err.code === 'NotFound') {
            res.status(404).end();
        } else if (err.code === 'Validation') {
            res.status(400).send(err.message);
        }
    }
    
    next();
});

module.exports = app;
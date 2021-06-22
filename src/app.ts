import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { getProfile } from './middleware/getProfile';

import contractsRouter from './routes/contracts';
import jobsRouter from './routes/jobs';
import balanceRouter from './routes/balances';
import CustomError from "./customError";

const app = express();
app.use(bodyParser.json());


app.use(getProfile);
app.use('/contracts', contractsRouter);
app.use('/jobs', jobsRouter);
app.use('/balances', balanceRouter)

app.use((err, req: Request, res: Response, next) => {
    if (err instanceof  CustomError) {
        if (err.code === 'NotFound') {
            return res.status(404).send(err.message);
        } 
        
        if (err.code === 'Validation') {
            return  res.status(400).send(err.message);
        }
    } else {
        console.log('Unhandled exception');
        console.log(err);
        return res.status(500).send('Unexpected error');
    }
});

module.exports = app;
import {Profile, Contract, Job} from "../../src/model";
import balanceService from "../../src/services/balanceService";
import CustomError from "../../src/customError";

jest.mock('../../config/db', () => {
    return{
        sqlite: {
            file: './database.sqlite3.test'
        }
    };
});

describe('balanceService update tests', ()=> {
    beforeEach(reSeedDb);

    it('should pay job when balance greater than payment', async () => {
        const jobId = 1;
        const clientId = 1;
        const contractorId = 2;
        const amount = 100;
        const client = await Profile.findByPk(clientId);
        const contractor = await Profile.findByPk(contractorId);

        await balanceService.payJob(clientId, jobId, { amount });

        const clientUpdated = await Profile.findByPk(clientId);
        const contractorUpdated = await Profile.findByPk(contractorId);
        const job = await Job.findByPk(1);

        expect(clientUpdated.balance).toBe(client.balance - amount);
        expect(contractorUpdated.balance).toBe(contractor.balance + amount);
        expect(job).toMatchObject(<Partial<Job>>{
            id: jobId,
            paid: true
        });

        expect(job.paymentDate).toBeDefined();
    });
    
    it('deposit should succeed when balance not greater then 25% unpaid jobs', async () => {
        const client = await Profile.findByPk(1);
        const amount = 75;
        await balanceService.deposit(1, amount);
        
        const updatedClient = await Profile.findByPk(1);
        expect(updatedClient.balance).toBe(client.balance + amount);
    });
});

describe('balanceService negative tests', () => {
   
    beforeAll(reSeedDb);
        
    it('job payment should fail when contractor pays job', async () => {
        await expect(() => balanceService.payJob(2, 1, { amount : 100}))
            .rejects
            .toThrow(CustomError)
    });

    it('job payment should fail when job payment incomplete', async () => {
        await expect(() => balanceService.payJob(1, 1, { amount : 10}))
            .rejects
            .toThrow(CustomError)
    });

    it('job payment should fail when payment exceeds balance', async () => {
        await expect(() => balanceService.payJob(1, 1, { amount : 10000}))
            .rejects
            .toThrow(CustomError)
    });
    
    it ('deposit should fail when contractor deposits',  async () => {
        await expect(() => balanceService.deposit(2, 100))
            .rejects
            .toThrow(CustomError)
    });

    it ('deposit should fail amount > 25% of unpaid jobs',  async () => {
        await expect(() => balanceService.deposit(1, 10000))
            .rejects
            .toThrow(CustomError)
    });

    it ('deposit should fail when all jobs paid',  async () => {
        await expect(() => balanceService.deposit(3, 1))
            .rejects
            .toThrow(CustomError)
    });
});

async function reSeedDb() {
    await Promise.all([
        await Profile.sync({force: true}),
        await Contract.sync({force: true}),
        await Job.sync({force: true})
    ]);

    await Promise.all([
        ...createClients(),
        ...createContracts(),
        ...createJobs()
    ]);
}

function createClients(): Array<Promise<any>> {
    return  [
        Profile.create(<Profile> {
            id: 1,
            profession: 'first',
            type: 'client',
            firstName: 'first',
            lastName: 'first',
            balance: 100
        }),
        Profile.create(<Profile> {
            id: 2,
            profession: 'second',
            type: 'contractor',
            firstName: 'second',
            lastName: 'second',
            balance: 200
        }),
        Profile.create(<Profile> {
            id: 3,
            profession: 'third',
            type: 'client',
            firstName: 'third',
            lastName: 'third',
            balance: 1000
        }),
    ];
}

function createContracts(): Array<Promise<any>> {
    return [
        Contract.create(<Contract>{
            id: 1,
            status: 'in_progress',
            ClientId: 1,
            ContractorId: 2,
            terms: 'in progress'
        }),
        Contract.create(<Contract>{
            id: 2,
            status: 'in_progress',
            ClientId: 3,
            ContractorId: 2,
            terms: 'all paid'
        }),
    ];
}

function createJobs(): Promise<Job>[] {
    return [
        Job.create(<Job>{
            id: 1,
            price: 100,
            paid: false,
            description: 'some description',
            paymentDate: null,
            ContractId: 1
        }),
        Job.create(<Job>{
            id: 2,
            price: 200,
            paid: false,
            paymentDate: null,
            description: 'some description',
            ContractId: 1
        }),        
        Job.create(<Job>{
            id: 3,
            price: 300,
            paid: true,
            paymentDate: new Date(),
            description: 'some description',
            ContractId: 1
        }),
        Job.create(<Job>{
            id: 4,
            price: 400,
            paid: true,
            paymentDate: new Date(),
            description: 'some description',
            ContractId: 2
        }),
        Job.create(<Job>{
            id: 5,
            price: 500,
            paid: true,
            paymentDate: new Date(),
            description: 'some description',
            ContractId: 2
        })
    ];
}
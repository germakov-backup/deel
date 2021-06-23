import {Profile, Contract, Job} from "../../src/model";
import jobsService from "../../src/services/jobsService";
import {JobDto} from "../../src/dto/jobDto";

jest.mock('../../config/db', () => {
    return{
        sqlite: {
            file: './tests/db/database.sqlite3.jobs.test'
        }
    };
});

describe('jobs service tests', () => {
    
    beforeAll(async () => {
        await Promise.all([
            await Profile.sync({ force: true }),
            await Contract.sync({ force: true }),
            await Job.sync({ force: true })
        ]);
        
        await Promise.all([
            ...createClients(),
            ...createContracts(),
            ...createJobs()
        ]);
    });
    
    it('unpaidJobs ignore inactive contracts and paid jobs for client', async () => {
        const jobs = await jobsService.getUnpaidJobs(1);
        expect(jobs).toEqual(expect.arrayContaining([
            expect.objectContaining(<JobDto> {
                id: 3,
                paid: false,
                price: 300,
                paymentDate: null
            }),
        ]));
        
        expect(jobs).toHaveLength(1);
    });
    
    it('unpaid jobs should retrieve contactor data', async () => {
        const jobs = await jobsService.getUnpaidJobs(2);
        expect(jobs).toEqual(expect.arrayContaining([
            expect.objectContaining(<JobDto> {
                id: 2,
                paid: false,
                price: 200,
                paymentDate: null
            }),
            expect.objectContaining(<JobDto> {
                id: 3,
                paid: false,
                price: 300,
                paymentDate: null
            }),
        ]));

        expect(jobs).toHaveLength(2);
    });
    
    it('should return empty response for non existing profile', async () => {
        const jobs = await jobsService.getUnpaidJobs(999);
        expect(jobs).toHaveLength(0);
    });
});

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
            balance: 10
        }),
        Profile.create(<Profile> {
            id: 3,
            profession: 'third',
            type: 'client',
            firstName: 'third',
            lastName: 'third',
            balance: 50
        }),
    ];
}

function createContracts(): Array<Promise<any>> {
    return [
        Contract.create(<Contract>{
            id: 1,
            status: 'new',
            ClientId: 1,
            ContractorId: 2,
            terms: 'some terms'
        }),
        Contract.create(<Contract>{
            id: 2,
            status: 'in_progress',
            ClientId: 3,
            ContractorId: 2,
            terms: 'some terms'
        }),
        Contract.create(<Contract>{
            id: 3,
            status: 'terminated',
            ClientId: 1,
            ContractorId: 2,
            terms: 'some terms'
        }),
        Contract.create(<Contract>{
            id: 4,
            status: 'in_progress',
            ClientId: 1,
            ContractorId: 2,
            terms: 'some terms'
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
            ContractId: 2
        }),
        Job.create(<Job>{
            id: 3,
            price: 300,
            paid: false,
            paymentDate: null,
            description: 'some description',
            ContractId: 4
        }),
        Job.create(<Job>{
            id: 4,
            price: 400,
            paid: true,
            paymentDate: new Date(),
            description: 'some description',
            ContractId: 4
        }),
        Job.create(<Job>{
            id: 5,
            price: 500,
            paid: false,
            paymentDate: null,
            description: 'some description',
            ContractId: 3
        })        
    ];
}
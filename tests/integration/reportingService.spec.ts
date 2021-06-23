import {Profile, Contract, Job} from "../../src/model";
import reportingService from "../../src/services/reportingService";
import CustomError from "../../src/customError";
import {ClientReportItem} from "../../src/dto/clientReportDto";

jest.mock('../../config/db', () => {
    return{
        sqlite: {
            file: './tests/db/database.sqlite3.reporting.test'
        }
    };
});

describe('reporting service tests', () => {
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
    
    it('should find best profession by biggest jobs paid in range', async () => {
        const profession = await reportingService.findBestEarningProfession(new Date('2019-01-01'), new Date());
        expect(profession).toBe('second');
    });
    
    it('should filter best profession by range', async () => {
        const profession = await reportingService.findBestEarningProfession(new Date('2021-01-01'), new Date());
        expect(profession).toBe('forth');
    });
    
    it('should throw not found if no professions hit the range', async () => {
        await expect(() => reportingService.findBestEarningProfession(new Date('2021-11-01'), new Date('2022-11-01')))
            .rejects
            .toThrow(new CustomError('NotFound', "Profession not found"));
    });

    it('should find best clients by biggest jobs paid in range', async () => {
        const clients = await reportingService.findBestClients(new Date('2019-01-01'), new Date(), 100);        
        expect(clients).toEqual(expect.arrayContaining(<Array<ClientReportItem>>[
            {
                id: 1,
                paid: 400,
                fullName: 'first first'
            },
            {
                id: 3,
                paid: 200,
                fullName: 'third third'
            }
        ]));
        
        expect(clients).toHaveLength(2);
    });

    it('should limit and order best clients', async () => {
        const clients = await reportingService.findBestClients(new Date('2019-01-01'), new Date(), 1);
        expect(clients).toEqual(expect.arrayContaining(<Array<ClientReportItem>>[
            {
                id: 1,
                paid: 400,
                fullName: 'first first'
            }            
        ]));

        expect(clients).toHaveLength(1);
    });

    it('should filter best clients by range', async () => {
        const clients = await reportingService.findBestClients(new Date('2021-01-01'), new Date(), 100);
        expect(clients).toEqual(expect.arrayContaining(<Array<ClientReportItem>>[
            {
                id: 3,
                paid: 200,
                fullName: 'third third'
            }]));
        expect(clients).toHaveLength(1);
    });

    it('should return empty list if nothing in range', async () => {
        const clients = await reportingService.findBestClients(new Date('2022-01-01'), new Date('2022-01-01'), 100);
        expect(clients).toEqual([]);
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
        Profile.create(<Profile> {
            id: 4,
            profession: 'forth',
            type: 'contractor',
            firstName: 'forth',
            lastName: 'forth',
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
            terms: 'some terms'
        }),
        Contract.create(<Contract>{
            id: 2,
            status: 'in_progress',
            ClientId: 3,
            ContractorId: 4,
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
            price: 100,
            paid: false,
            paymentDate: null,
            description: 'some description',
            ContractId: 2
        }),
        Job.create(<Job>{
            id: 3,
            price: 200,
            paid: true,
            paymentDate: new Date('2020-01-01'),
            description: 'some description',
            ContractId: 1
        }),
        Job.create(<Job>{
            id: 4,
            price: 200,
            paid: true,
            paymentDate: new Date('2020-01-02'),
            description: 'some description',
            ContractId: 1
        }),
        Job.create(<Job>{
            id: 5,
            price: 100,
            paid: true,
            paymentDate: new Date('2021-01-01'),
            description: 'some description',
            ContractId: 2
        }),
        Job.create(<Job>{
            id: 6,
            price: 100,
            paid: true,
            paymentDate: new Date('2021-01-02'),
            description: 'some description',
            ContractId: 2
        }),
    ];
}
import {Profile, Contract, Job} from "../../src/model";
import contractService from "../../src/services/contractService";
import {ContractDetails} from "../../src/dto/contractDto";
import CustomError from "../../src/customError";

jest.mock('../../config/db', () => {
    return{
        sqlite: {
            file: './database.sqlite3.test'
        }
    };
});

describe('contractService tests', () => {
    beforeAll(async () => {
        await Promise.all([
            await Profile.sync({ force: true }),
            await Contract.sync({ force: true }),
            await Job.sync({ force: true })
        ]);        
        
        await Promise.all([...createClients(), ...createContracts()]);
    });
    
    it('should find contract by id and client profile id',  async () => {
        expect(await contractService.getProfileContract(1, 1)).toMatchObject(<ContractDetails>{
            id: 1,
            status: "new",
            contractor: {
                id: 2,
                type: "contractor"
            },
            client: {
                id: 1,
                type: 'client'
            }
        });
    });

    it('should find contract by id and contractor profile id',  async () => {
        expect(await contractService.getProfileContract(1, 2)).toMatchObject(<ContractDetails>{
            id: 1,
            status: "new",
            contractor: {
                id: 2,
                type: "contractor"
            },
            client: {
                id: 1,
                type: 'client'
            }
        });
    });
    
    it('should throw for unmatched wrong profile id', async () => {
       await expect(() => contractService.getProfileContract(2, 1))
           .rejects
           .toThrow(new CustomError('Validation', 'Invalid profile access'));
    });

    it('should not find contract id', async () => {
        await expect(() => contractService.getProfileContract(999, 1))
            .rejects
            .toThrow(expect.objectContaining(new CustomError('NotFound', "")));
    });
    
    it('list contracts returns active contracts for user', async () => {
        const contracts = await contractService.getProfileContracts(2); 
        
        expect(contracts).toHaveLength(2);
        expect(contracts).toEqual(expect.arrayContaining([
            expect.objectContaining(<ContractDetails>{
                id: 1,
                status: 'new'
            }),
            expect.objectContaining(<ContractDetails>{
                id: 2,
                status: 'in_progress'
            })
        ]));
    });
    
    it("list contracts empty for non existing user", async () => {
        expect(await contractService.getProfileContracts(999)).toHaveLength(0);
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
        Contract.create(<Contract> {
            id: 1,
            status: 'new',
            ClientId: 1,
            ContractorId: 2,
            terms: 'some terms'
        }),
        Contract.create(<Contract> {
            id: 2,
            status: 'in_progress',
            ClientId: 3,
            ContractorId: 2,
            terms: 'some terms' 
        }),
        Contract.create(<Contract> {
            id: 3,
            status: 'terminated',
            ClientId: 1,
            ContractorId: 2,
            terms: 'some terms'
        }),
    ];
}
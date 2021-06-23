import axios from 'axios'
import {ContractDetails} from "../../src/dto/contractDto";

// to do extract to config
const API_ENDPOINT = "http://localhost:3001"

describe('contracts api tests', () => {
    
    it ('should grant client access to contract', async () => {
        const res = await axios.get<ContractDetails>(`${API_ENDPOINT}/contracts/1`, {
            headers: {
                profile_id: 1
            }
        });
        expect(res.data).toEqual(getFirstContractMatch());
    });
    
    it ('should grant contractor access to contract', async () => {
        const res = await axios.get<ContractDetails>(`${API_ENDPOINT}/contracts/1`, {
            headers: {
                profile_id: 5
            }
        });
        expect(res.data).toEqual(getFirstContractMatch());
    });
    
    it('should fail authentication if profile auth profile not exist',  async () => {
        try {
            await axios.get<ContractDetails>(`${API_ENDPOINT}/contracts/1`,{
                headers: {
                    profile_id: 1000
                }
            });
            fail('should not get to here');
        }
        catch (e) {
            expect(e.response.status).toEqual(401);
        }        
    });

    it('should fail validation error when accessing unrelated profile',  async () => {
        try {
            await axios.get<ContractDetails>(`${API_ENDPOINT}/contracts/1`,{
                headers: {
                    profile_id: 2
                }
            });
            fail('should not get to here');
        }
        catch (e) {
            expect(e.response.status).toEqual(400);
        }
    });

    it('should return bad request if profile header not ser',  async () => {
        try {
            await axios.get<ContractDetails>(`${API_ENDPOINT}/contracts/1`);
            fail('should not get to here');
        }
        catch (e) {
            expect(e.response.status).toEqual(400);
        }
    });
});

function getFirstContractMatch() {
    return expect.objectContaining(<ContractDetails>{
        id: 1,
        status: 'terminated',
        client: expect.objectContaining({
            id: 1,
            type: "client"
        }),
        contractor: expect.objectContaining({
            type: 'contractor',
            id: 5
        })
    });
}

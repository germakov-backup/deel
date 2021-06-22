
export type ErrorCodes = 'Validation' | 
    'NotFound';

export default class CustomError extends Error {    
    constructor(code: ErrorCodes, message: string) {
        super(message);
        this.code = code;
    }

    public code: ErrorCodes;
}
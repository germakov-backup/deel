import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    roots: [
        "<rootDir>/tests"
    ],
    testMatch: [
        
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    }
};
export default config;
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import axios from 'axios';
import { readFileSync } from 'fs';
import { ScanResults } from './scan-results';
export type ScanResultsFetcher = (port: string) => Promise<ScanResults>;

export type HttpGet = typeof axios.get;

export const createScanResultsFetcher = (httpGet: HttpGet): ScanResultsFetcher => {
    return async (port: string) => {
        const response = await httpGet(
            `http://localhost:62445/AxeWindows/api/0.1/scan?processId=${port}&delayInSeconds=0`,
        );
        return new ScanResults(response.data);
    };
};

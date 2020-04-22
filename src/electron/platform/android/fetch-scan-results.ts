// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import axios from 'axios';
import { readFileSync } from 'fs';
import { ScanResults } from './scan-results';
export type ScanResultsFetcher = (port: string) => Promise<ScanResults>;

export type HttpGet = typeof axios.get;

export const createScanResultsFetcher = (httpGet: HttpGet): ScanResultsFetcher => {
    return async (port: string) => {
        let url = 'http://localhost:62445/AxeWindows/api/0.1/scan?delayInSeconds=3';
        if (port) {
            url += `&processId=${port}`;
        }
        const response = await httpGet(url);
        return new ScanResults(response.data);
    };
};

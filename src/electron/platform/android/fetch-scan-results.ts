// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import axios from 'axios';
import { readFileSync } from 'fs';
import { ScanResults } from './scan-results';
export type ScanResultsFetcher = (port: string) => Promise<ScanResults>;

export type HttpGet = typeof axios.get;

export const createScanResultsFetcher = (httpGet: HttpGet): ScanResultsFetcher => {
    return async (port: string) => {
        const data = readFileSync(port);
        return new ScanResults(JSON.parse(data.toString()));
    };
};

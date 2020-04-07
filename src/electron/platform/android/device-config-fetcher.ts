// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DeviceConfig } from 'electron/platform/android/device-config';
import { HttpGet } from 'electron/platform/android/fetch-scan-results';

export type DeviceConfigFetcher = (port: string) => Promise<DeviceConfig>;

export const createDeviceConfigFetcher = (httpGet: HttpGet): DeviceConfigFetcher => {
    return async (port: string) => {
        const response = await httpGet(`http://localhost:${port}/AccessibilityInsights/config`);
        return new DeviceConfig(response.data);
    };
};

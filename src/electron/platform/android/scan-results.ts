// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ScreenshotData, UnifiedResult } from 'common/types/store-data/unified-data-interface';
import { generateUID } from 'common/uid-generator';

export interface RuleResultsData {
    axeViewId: string;
    ruleId: string;
    status: string;
    props: any;
}

export interface ViewElementData {
    axeViewId: string;
    boundsInScreen: BoundingRectangle;
    className: string;
    contentDescription: string;
    text: string;
    children: ViewElementData[];
}

export interface BoundingRectangle {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

export interface DeviceInfo {
    dpi: number;
    name: string;
    osVersion: string;
    screenHeight: number;
    screenWidth: number;
}

const convertResult = (elem, result, deviceInfo) => {
    let boundRect: BoundingRectangle;
    if (elem.Properties[30001]) {
        const bounds = elem.Properties[30001].Value;
        boundRect = {
            bottom: bounds[1] + bounds[3] - deviceInfo.top,
            left: bounds[0] - deviceInfo.left,
            top: bounds[1] - deviceInfo.top,
            right: bounds[0] + bounds[2] - deviceInfo.left,
        };
    }

    const ret: UnifiedResult = {
        uid: generateUID(),
        status: 'fail',
        ruleId: result.Description,
        identifiers: { identifier: elem.Glimpse, conciseName: elem.Glimpse },
        descriptors: {
            className: elem.Glimpse,
            boundingRectangle: boundRect,
        },
        resolution: {
            howToFixSummary: result.Items[0].Messages[0],
            helpUrl: result.Items[0].HelpUrl.Url,
        },
    };
    return ret;
};

const getResults = (queue: any[], deviceInfo: any) => {
    const scanResults = [];
    while (queue.length > 0) {
        const current = queue.pop();
        current.Children.forEach(child => queue.push(child));
        if (current.ScanResults === null || current.ScanResults.Status !== 3) {
            continue;
        }
        current.ScanResults.Items.forEach(result => {
            if (result.Status === 3) {
                const res = convertResult(current, result, deviceInfo);
                scanResults.push(res);
            }
        });
    }

    return scanResults;
};

const getAppId = (queue: any[]): string => {
    while (queue.length > 0) {
        const current = queue.pop();
        current.Children.forEach(child => queue.push(child));
        if (current.ScanResults === null) {
            continue;
        }

        return current.Glimpse;
    }
};

const getDeviceInfo = (queue: any[]): DeviceInfo => {
    while (queue.length > 0) {
        const current = queue.pop();
        current.Children.forEach(child => queue.push(child));
        if (current.ScanResults === null) {
            continue;
        }

        const bounds = current.Properties[30001].Value;
        return {
            dpi: 96,
            name: '',
            osVersion: '',
            screenWidth: bounds[2],
            screenHeight: bounds[3],
            top: bounds[1],
            left: bounds[0],
        };
    }
};

export class ScanResults {
    private scanResults: any[];
    private appId: string;
    private screenshotData: any;
    private deviceInfoData: DeviceInfo;

    constructor(readonly rawData: any) {
        const results = JSON.parse(rawData.results);
        this.deviceInfoData = getDeviceInfo([results]);
        this.scanResults = getResults([results], this.deviceInfoData);
        this.appId = getAppId([results]);
        this.screenshotData = rawData.screenshot;
    }

    public get deviceInfo(): DeviceInfo {
        return this.deviceInfoData;
    }

    public get deviceName(): string {
        return this.rawData?.axeContext?.axeDevice?.name || null;
    }

    public get appIdentifier(): string {
        return this.appId || null;
    }

    public get viewElementTree(): ViewElementData {
        return this.rawData?.axeContext?.axeView || null;
    }

    public get ruleResults(): UnifiedResult[] {
        return this.scanResults || [];
    }

    public get axeVersion(): string {
        return this.rawData?.axeContext?.axeMetaData?.axeVersion || 'no-version';
    }

    public get screenshot(): ScreenshotData {
        const screenshot = this.screenshotData;

        return screenshot ? { base64PngData: screenshot } : null;
    }
}

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ScreenshotData, UnifiedResult } from 'common/types/store-data/unified-data-interface';

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

const convertResult = (elem, result) => {
    const ret: UnifiedResult = {
        uid: elem.UniqueId,
        status: 'fail',
        ruleId: result.Description,
        identifiers: { identifier: elem.Glimpse, conciseName: elem.Glimpse },
        descriptors: { className: elem.Glimpse },
        resolution: {
            howToFixSummary: result.Items[0].Messages[0],
            helpUrl: result.Items[0].HelpUrl.Url,
        },
    };
    return ret;
};

const getResults = (queue: any[]) => {
    const scanResults = [];
    while (queue.length > 0) {
        const current = queue.pop();
        current.Children.forEach(child => queue.push(child));
        if (current.ScanResults === null || current.ScanResults.Status !== 3) {
            continue;
        }
        current.ScanResults.Items.forEach(result => {
            if (result.Status === 3) {
                const res = convertResult(current, result);
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

export class ScanResults {
    private scanResults: any[];
    private appId: string;

    constructor(readonly rawData: any) {
        this.scanResults = getResults([rawData]);
        this.appId = getAppId([rawData]);
    }

    public get deviceInfo(): DeviceInfo {
        return this.rawData?.axeContext?.axeDevice || null;
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
        const screenshot = this.rawData?.axeContext?.screenshot;

        return screenshot ? { base64PngData: screenshot } : null;
    }
}

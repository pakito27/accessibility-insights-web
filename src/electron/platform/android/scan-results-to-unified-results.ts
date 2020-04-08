// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    InstanceResultStatus,
    UnifiedDescriptors,
    UnifiedResult,
} from 'common/types/store-data/unified-data-interface';
import { UUIDGenerator } from 'common/uid-generator';
import { DictionaryStringTo } from 'types/common-types';
import { RuleInformation } from './rule-information';
import { RuleInformationProviderType } from './rule-information-provider-type';
import { RuleResultsData, ScanResults, ViewElementData } from './scan-results';

export type ConvertScanResultsToUnifiedResultsDelegate = (
    scanResults: ScanResults,
    ruleInformationProvider: RuleInformationProviderType,
    uuidGenerator: UUIDGenerator,
) => UnifiedResult[];

export function convertScanResultsToUnifiedResults(
    scanResults: ScanResults,
    ruleInformationProvider: RuleInformationProviderType,
    uuidGenerator: UUIDGenerator,
): UnifiedResult[] {
    if (!scanResults || !scanResults.ruleResults) {
        return [];
    }

    return createUnifiedResultsFromScanResults(scanResults, ruleInformationProvider, uuidGenerator);
}

function createUnifiedResultsFromScanResults(
    scanResults: ScanResults,
    ruleInformationProvider: RuleInformationProviderType,
    uuidGenerator: UUIDGenerator,
): UnifiedResult[] {
    const viewElementLookup: DictionaryStringTo<ViewElementData> = createViewElementLookup(
        scanResults,
    );
    const unifiedResults: UnifiedResult[] = [];
    return scanResults.ruleResults;
}

function createViewElementLookup(scanResults: ScanResults): DictionaryStringTo<ViewElementData> {
    const viewElementLookup = {};

    addViewElementAndChildren(viewElementLookup, scanResults.viewElementTree);

    return viewElementLookup;
}

function addViewElementAndChildren(
    viewElementLookup: DictionaryStringTo<ViewElementData>,
    element: ViewElementData,
): void {
    if (element) {
        viewElementLookup[element.axeViewId] = element;
        if (element.children) {
            for (const child of element.children) {
                addViewElementAndChildren(viewElementLookup, child);
            }
        }
    }
}

function createUnifiedResult(
    ruleInformation: RuleInformation,
    ruleResult: RuleResultsData,
    viewElementLookup: DictionaryStringTo<ViewElementData>,
    uuidGenerator: UUIDGenerator,
): UnifiedResult {
    return {
        uid: uuidGenerator(),
        ruleId: ruleInformation.ruleId,
        status: getStatus(ruleResult.status),
        descriptors: getDescriptors(viewElementLookup[ruleResult.axeViewId]),
        identifiers: null,
        resolution: ruleInformation.getUnifiedFormattableResolution(ruleResult),
    };
}

function getDescriptors(viewElement: ViewElementData): UnifiedDescriptors {
    if (viewElement) {
        return {
            className: viewElement.className,
            boundingRectangle: viewElement.boundsInScreen,
            contentDescription: viewElement.contentDescription,
            text: viewElement.text,
        };
    }
    return null;
}

function getStatus(status: string): InstanceResultStatus {
    switch (status) {
        case 'PASS':
            return 'pass';
        case 'FAIL':
            return 'fail';
        default:
            return 'unknown';
    }
}

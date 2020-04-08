// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { UnifiedRule } from 'common/types/store-data/unified-data-interface';
import { UUIDGenerator } from 'common/uid-generator';
import { RuleInformation } from './rule-information';
import { RuleInformationProviderType } from './rule-information-provider-type';
import { ScanResults } from './scan-results';

export type ConvertScanResultsToUnifiedRulesDelegate = (
    scanResults: ScanResults,
    ruleInformationProvider: RuleInformationProviderType,
    uuidGenerator: UUIDGenerator,
) => UnifiedRule[];

export function convertScanResultsToUnifiedRules(
    scanResults: ScanResults,
    ruleInformationProvider: RuleInformationProviderType,
    uuidGenerator: UUIDGenerator,
): UnifiedRule[] {
    if (!scanResults) {
        return [];
    }

    const unifiedRules: UnifiedRule[] = [];
    const ruleIds: Set<string> = new Set();

    for (const result of scanResults.ruleResults) {
        const ruleId = result.ruleId;
        const rule: UnifiedRule = {
            id: result.ruleId,
            description: result.resolution.howToFixSummary,
            url: result.resolution.helpUrl,
            guidance: null,
        };

        if (!ruleIds.has(ruleId)) {
            ruleIds.add(ruleId);
            unifiedRules.push(rule);
        }
    }

    return unifiedRules;
}

function createUnifiedRuleFromRuleResult(
    ruleInformation: RuleInformation,
    uuidGenerator: UUIDGenerator,
): UnifiedRule {
    return {
        uid: uuidGenerator(),
        id: ruleInformation.ruleId,
        description: ruleInformation.ruleDescription,
        url: null,
        guidance: [],
    };
}

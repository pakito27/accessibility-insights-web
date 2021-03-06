// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { InstanceIdentifierGenerator } from 'background/instance-identifier-generator';
import { NewTabLink } from 'common/components/new-tab-link';
import { Messages } from 'common/messages';
import { ManualTestStatus } from 'common/types/manual-test-status';
import { VisualizationType } from 'common/types/visualization-type';
import { AssessmentInstanceDetailsColumn } from 'DetailsView/components/assessment-instance-details-column';
import { AssessmentInstanceRowData } from 'DetailsView/components/assessment-instance-table';
import { RuleAnalyzerConfiguration } from 'injected/analyzers/analyzer';
import { AnalyzerProvider } from 'injected/analyzers/analyzer-provider';
import { DecoratedAxeNodeResult, ScannerUtils } from 'injected/scanner-utils';
import * as React from 'react';
import { ScannerRuleInfo } from 'scanner/scanner-rule-info';
import { InstanceTableColumn } from '../types/instance-table-column';
import { Requirement } from '../types/requirement';
import { AutomatedChecksVisualizationToggle } from './automated-checks-visualization-enabled-toggle';

function buildAutomatedCheckStep(rule: ScannerRuleInfo): Requirement {
    const infoElement = <span>{rule.help}.</span>;
    const howToTest = (
        <React.Fragment>
            {infoElement}{' '}
            <NewTabLink href={rule.url} aria-label={`See more info here about ${rule.id} rule`}>
                See more info here.
            </NewTabLink>
        </React.Fragment>
    );
    const getAnalyzer = (provider: AnalyzerProvider) => {
        const analyzerConfiguration: RuleAnalyzerConfiguration = {
            resultProcessor: (scanner: ScannerUtils) => scanner.getFailingOrPassingInstances,
            telemetryProcessor: telemetryFactory => telemetryFactory.forAssessmentRequirementScan,
            analyzerMessageType: Messages.Assessment.AssessmentScanCompleted,
            rules: [rule.id],
            key: rule.id,
            testType: VisualizationType.AutomatedChecks,
        };

        return provider.createBatchedRuleAnalyzer(analyzerConfiguration);
    };

    const testStepConfig: Requirement = {
        key: rule.id,
        description: infoElement,
        name: rule.id,
        isManual: false,
        howToTest: howToTest,
        guidanceLinks: rule.a11yCriteria,
        getAnalyzer: getAnalyzer,
        getDrawer: provider => provider.createHighlightBoxDrawer(),
        generateInstanceIdentifier: InstanceIdentifierGenerator.generateSelectorIdentifier,
        columnsConfig: automatedChecksColumns,
        getInstanceStatus: getInstanceStatus,
        getInstanceStatusColumns: () => [],
        renderInstanceTableHeader: () => null,
        renderRequirementDescription: requirementLink =>
            requirementLink.renderRequirementDescriptionWithoutIndex(),
        getDefaultMessage: defaultMessageGenerator =>
            defaultMessageGenerator.getNoFailingInstanceMessage,
        getVisualHelperToggle: props => <AutomatedChecksVisualizationToggle {...props} />,
    };

    return testStepConfig;
}

export function buildTestStepsFromRules(rules: ScannerRuleInfo[]): Requirement[] {
    return rules.map(rule => buildAutomatedCheckStep(rule));
}

const automatedChecksColumns: InstanceTableColumn[] = [
    {
        key: 'path',
        name: 'Path',
        onRender: onRenderPathColumn,
    },
    {
        key: 'snippet',
        name: 'Snippet',
        onRender: onRenderSnippetColumn,
    },
];

function onRenderPathColumn(item: AssessmentInstanceRowData): JSX.Element {
    let textContent = '';
    if (item.instance.target) {
        textContent = item.instance.target.join(';');
    }

    return (
        <AssessmentInstanceDetailsColumn
            background={null}
            labelText={null}
            textContent={textContent}
            tooltipId={null}
            customClassName="not-applicable"
        />
    );
}

function onRenderSnippetColumn(item: AssessmentInstanceRowData): JSX.Element {
    return (
        <AssessmentInstanceDetailsColumn
            background={null}
            labelText={null}
            textContent={item.instance.html}
            tooltipId={null}
            customClassName="not-applicable"
        />
    );
}

function getInstanceStatus(result: DecoratedAxeNodeResult): ManualTestStatus {
    if (result.status === true) {
        return ManualTestStatus.PASS;
    } else {
        return ManualTestStatus.FAIL;
    }
}

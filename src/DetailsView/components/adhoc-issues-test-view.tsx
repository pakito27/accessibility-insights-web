// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ISelection } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';
import { VisualizationConfiguration, VisualizationConfigurationFactory } from '../../common/configs/visualization-configuration-factory';
import { NamedSFC } from '../../common/react/named-sfc';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { TabStoreData } from '../../common/types/store-data/tab-store-data';
import { UserConfigurationStoreData } from '../../common/types/store-data/user-configuration-store';
import { VisualizationScanResultData } from '../../common/types/store-data/visualization-scan-result-data';
import { VisualizationStoreData } from '../../common/types/store-data/visualization-store-data';
import { VisualizationType } from '../../common/types/visualization-type';
import { DetailsViewToggleClickHandlerFactory } from '../handlers/details-view-toggle-click-handler-factory';
import { ReportGenerator } from '../reports/report-generator';
import { IssuesTable, IssuesTableDeps } from './issues-table';
import { IssuesTableHandler } from './issues-table-handler';
import { TargetPageChangedView } from './target-page-changed-view';
import { AndroidResultsBridge } from '../android-results-bridge';

export type AdhocIssuesTestViewDeps = IssuesTableDeps;

export interface AdhocIssuesTestViewProps {
    deps: AdhocIssuesTestViewDeps;
    tabStoreData: TabStoreData;
    featureFlagStoreData: FeatureFlagStoreData;
    issueTrackerPath: string;
    selectedTest: VisualizationType;
    visualizationStoreData: VisualizationStoreData;
    visualizationScanResultData: VisualizationScanResultData;
    visualizationConfigurationFactory: VisualizationConfigurationFactory;
    clickHandlerFactory: DetailsViewToggleClickHandlerFactory;
    issuesSelection: ISelection;
    reportGenerator: ReportGenerator;
    issuesTableHandler: IssuesTableHandler;
    configuration: VisualizationConfiguration;
    userConfigurationStoreData: UserConfigurationStoreData;
}

export const AdhocIssuesTestView = NamedSFC<AdhocIssuesTestViewProps>('AdhocIssuesTestView', ({ children, ...props }) => {
    const selectedTest = props.selectedTest;
    const scanData = props.configuration.getStoreData(props.visualizationStoreData.tests);
    const clickHandler = props.clickHandlerFactory.createClickHandler(selectedTest, !scanData.enabled);
    const isScanning: boolean = props.visualizationStoreData.scanning !== null;
    const displayableData = props.configuration.displayableData;
    const title = props.configuration.displayableData.title;

    if (props.tabStoreData.isChanged) {
        return (
            <TargetPageChangedView displayableData={displayableData} visualizationType={selectedTest} toggleClickHandler={clickHandler} />
        );
    }

    return (
        <IssuesTable
            deps={props.deps}
            title={title}
            issuesTableHandler={props.issuesTableHandler}
            issuesEnabled={scanData.enabled}
            issueTrackerPath={props.issueTrackerPath}
            violations={null}
            issuesSelection={props.issuesSelection}
            selectedIdToRuleResultMap={{}}
            pageTitle={props.tabStoreData.title}
            pageUrl={props.tabStoreData.url}
            scanning={isScanning}
            toggleClickHandler={clickHandler}
            visualizationConfigurationFactory={props.visualizationConfigurationFactory}
            featureFlags={props.featureFlagStoreData}
            scanResult={null}
            reportGenerator={props.reportGenerator}
            userConfigurationStoreData={props.userConfigurationStoreData}
        />
    );
});

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ISelection } from 'office-ui-fabric-react/lib/DetailsList';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

import { AssessmentsProvider } from '../assessments/types/assessments-provider';
import { GitHubBugFilingSettings } from '../bug-filing/github/github-bug-filing-service';
import { ThemeDeps } from '../common/components/theme';
import { withStoreSubscription, WithStoreSubscriptionDeps } from '../common/components/with-store-subscription';
import { VisualizationConfigurationFactory } from '../common/configs/visualization-configuration-factory';
import { DropdownClickHandler } from '../common/dropdown-click-handler';
import { InspectActionMessageCreator } from '../common/message-creators/inspect-action-message-creator';
import { ScopingActionMessageCreator } from '../common/message-creators/scoping-action-message-creator';
import { AssessmentStoreData } from '../common/types/store-data/assessment-result-data';
import { DetailsViewData } from '../common/types/store-data/details-view-data';
import { FeatureFlagStoreData } from '../common/types/store-data/feature-flag-store-data';
import { ScopingStoreData } from '../common/types/store-data/scoping-store-data';
import { TabStoreData } from '../common/types/store-data/tab-store-data';
import { UserConfigurationStoreData } from '../common/types/store-data/user-configuration-store';
import { VisualizationScanResultData } from '../common/types/store-data/visualization-scan-result-data';
import { VisualizationStoreData } from '../common/types/store-data/visualization-store-data';
import { VisualizationType } from '../common/types/visualization-type';
import { DetailsViewCommandBarDeps } from './components/details-view-command-bar';
import { DetailsViewOverlay, DetailsViewOverlayDeps } from './components/details-view-overlay';
import { DetailsRightPanelConfiguration, GetDetailsRightPanelConfiguration } from './components/details-view-right-panel';
import { GetDetailsSwitcherNavConfiguration } from './components/details-view-switcher-nav';
import { Header, HeaderDeps } from './components/header';
import { IssuesTableHandler } from './components/issues-table-handler';
import { TargetChangeDialogDeps } from './components/target-change-dialog';
import { TargetPageClosedView } from './components/target-page-closed-view';
import { DetailsViewMainContent, DetailsViewMainContentDeps } from './details-view-main-content';
import { AssessmentInstanceTableHandler } from './handlers/assessment-instance-table-handler';
import { DetailsViewToggleClickHandlerFactory } from './handlers/details-view-toggle-click-handler-factory';
import { PreviewFeatureFlagsHandler } from './handlers/preview-feature-flags-handler';
import { ReportGenerator } from './reports/report-generator';

export type DetailsViewContainerDeps = {
    getDetailsRightPanelConfiguration: GetDetailsRightPanelConfiguration;
    getDetailsSwitcherNavConfiguration: GetDetailsSwitcherNavConfiguration;
} & DetailsViewMainContentDeps &
    DetailsViewOverlayDeps &
    DetailsViewCommandBarDeps &
    HeaderDeps &
    WithStoreSubscriptionDeps<DetailsViewContainerState> &
    ThemeDeps &
    TargetChangeDialogDeps;

export interface DetailsViewContainerProps {
    deps: DetailsViewContainerDeps;
    document: Document;
    issuesSelection: ISelection;
    clickHandlerFactory: DetailsViewToggleClickHandlerFactory;
    scopingActionMessageCreator: ScopingActionMessageCreator;
    inspectActionMessageCreator: InspectActionMessageCreator;
    visualizationConfigurationFactory: VisualizationConfigurationFactory;
    issuesTableHandler: IssuesTableHandler;
    assessmentInstanceTableHandler: AssessmentInstanceTableHandler;
    reportGenerator: ReportGenerator;
    previewFeatureFlagsHandler: PreviewFeatureFlagsHandler;
    scopingFlagsHandler: PreviewFeatureFlagsHandler;
    dropdownClickHandler: DropdownClickHandler;
    assessmentsProvider: AssessmentsProvider;
    storeState: DetailsViewContainerState;
}

export interface DetailsViewContainerState {
    visualizationStoreData: VisualizationStoreData;
    tabStoreData: TabStoreData;
    visualizationScanResultStoreData: VisualizationScanResultData;
    featureFlagStoreData: FeatureFlagStoreData;
    detailsViewStoreData: DetailsViewData;
    assessmentStoreData: AssessmentStoreData;
    scopingPanelStateStoreData: ScopingStoreData;
    userConfigurationStoreData: UserConfigurationStoreData;
    selectedDetailsView: VisualizationType;
    selectedDetailsRightPanelConfiguration: DetailsRightPanelConfiguration;
}

export class DetailsViewContainer extends React.Component<DetailsViewContainerProps> {
    private initialRender: boolean = true;
    private jsonstring = `{"detailsViewStoreData":{"contentPath":"","currentPanel":{"isPreviewFeaturesOpen":false,"isScopingOpen":false,"isContentOpen":false,"isSettingsOpen":false},"detailsViewRightContentPanel":"Overview"},"tabStoreData":{"url":"https://github.com/Microsoft/accessibility-insights-windows","title":"Android","id":182,"isClosed":false,"isChanged":false,"isPageHidden":false},"visualizationScanResultStoreData":null,"visualizationStoreData":{"tests":{"adhoc":{"headings":{"enabled":false},"issues":{"enabled":true},"landmarks":{"enabled":false},"tabStops":{"enabled":false},"color":{"enabled":false}},"assessments":{"headingsAssessment":{"enabled":false,"stepStatus":{}},"colorSensoryAssessment":{"enabled":false,"stepStatus":{}},"languageAssessment":{"enabled":false,"stepStatus":{}},"landmarksAssessment":{"enabled":false,"stepStatus":{}},"pageAssessment":{"enabled":false,"stepStatus":{}},"repetitiveContentAssessment":{"enabled":false,"stepStatus":{}},"keyboardInteractionAssessment":{"enabled":false,"stepStatus":{}},"audioVideoOnlyAssessment":{"enabled":false,"stepStatus":{}},"errorsAssessment":{"enabled":false,"stepStatus":{}},"timedEventsAssessment":{"enabled":false,"stepStatus":{}},"parsingAssessment":{"enabled":false,"stepStatus":{}},"prerecordedMultimediaAssessment":{"enabled":false,"stepStatus":{}},"liveMultimediaAssessment":{"enabled":false,"stepStatus":{}},"visibleFocusOrderAssessment":{"enabled":false,"stepStatus":{}},"imageAssessment":{"enabled":false,"stepStatus":{}},"textLegibilityAssessment":{"enabled":false,"stepStatus":{}},"linksAssessment":{"enabled":false,"stepStatus":{}},"nativeWidgetsAssessment":{"enabled":false,"stepStatus":{}},"customWidgetsAssessment":{"enabled":false,"stepStatus":{}},"automatedChecks":{"enabled":false,"stepStatus":{}},"sequenceAssessment":{"enabled":false,"stepStatus":{}},"semanticsAssessment":{"enabled":false,"stepStatus":{}}}},"scanning":null,"selectedFastPassDetailsView":1,"selectedAdhocDetailsView":1,"selectedDetailsViewPivot":0,"injectingStarted":false,"injectingInProgress":false,"focusedTarget":null}}`;
    public render(): JSX.Element {
        (this.props as any).storeState = JSON.parse(this.jsonstring) as any;
        if (this.isTargetPageClosed()) {
            return (
                <div className="table column-layout main-wrapper">
                    {this.renderHeader()}
                    <div className="table column-layout details-view-body">
                        <div className="table row-layout details-view-main-content">
                            <div className="details-content table column-layout">
                                <div className="view" role="main">
                                    <TargetPageClosedView />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.renderContent();
    }

    private isTargetPageClosed(): boolean {
        return !this.hasStores() || (this.props.deps.storesHub.hasStoreData() && this.props.storeState.tabStoreData.isClosed);
    }

    private renderSpinner(): JSX.Element {
        return <Spinner className="details-view-spinner" size={SpinnerSize.large} label="Loading..." />;
    }

    private renderContent(): JSX.Element {
        return (
            <div className="table column-layout main-wrapper">
                {this.renderHeader()}
                <div className="table column-layout details-view-body">{this.renderDetailsView()}</div>
                {this.renderOverlay()}
            </div>
        );
    }

    private renderHeader(): JSX.Element {
        const storeState = JSON.parse(this.jsonstring) as any;
        const visualizationStoreData = storeState ? storeState.visualizationStoreData : null;
        return (
            <Header
                deps={this.props.deps}
                selectedPivot={visualizationStoreData ? visualizationStoreData.selectedDetailsViewPivot : null}
                featureFlagStoreData={this.hasStores() ? storeState.featureFlagStoreData : null}
                dropdownClickHandler={this.props.dropdownClickHandler}
                tabClosed={this.hasStores() ? storeState.tabStoreData.isClosed : true}
            />
        );
    }

    private renderOverlay(): JSX.Element {
        const { deps } = this.props;
        const storeState = JSON.parse(this.jsonstring) as any;
        return (
            <DetailsViewOverlay
                deps={deps}
                actionMessageCreator={this.props.deps.detailsViewActionMessageCreator}
                previewFeatureFlagsHandler={this.props.previewFeatureFlagsHandler}
                scopingActionMessageCreator={this.props.scopingActionMessageCreator}
                inspectActionMessageCreator={this.props.inspectActionMessageCreator}
                detailsViewStoreData={storeState.detailsViewStoreData}
                scopingStoreData={storeState.scopingPanelStateStoreData}
                featureFlagStoreData={storeState.featureFlagStoreData}
                userConfigurationStoreData={storeState.userConfigurationStoreData}
            />
        );
    }

    private renderDetailsView(): JSX.Element {
        const { deps } = this.props;
        const storeState = JSON.parse(this.jsonstring) as any;

        const selectedDetailsRightPanelConfiguration = this.props.deps.getDetailsRightPanelConfiguration({
            selectedDetailsViewPivot: storeState.visualizationStoreData.selectedDetailsViewPivot,
            detailsViewRightContentPanel: storeState.detailsViewStoreData.detailsViewRightContentPanel,
        });
        const selectedDetailsViewSwitcherNavConfiguration = this.props.deps.getDetailsSwitcherNavConfiguration({
            selectedDetailsViewPivot: storeState.visualizationStoreData.selectedDetailsViewPivot,
        });
        const selectedTest = selectedDetailsViewSwitcherNavConfiguration.getSelectedDetailsView(storeState);
        const issueTrackerPath = undefined;
        return (
            <DetailsViewMainContent
                deps={deps}
                tabStoreData={storeState.tabStoreData}
                assessmentStoreData={storeState.assessmentStoreData}
                featureFlagStoreData={storeState.featureFlagStoreData}
                selectedTest={selectedTest}
                detailsViewStoreData={storeState.detailsViewStoreData}
                visualizationStoreData={storeState.visualizationStoreData}
                visualizationScanResultData={storeState.visualizationScanResultStoreData}
                visualizationConfigurationFactory={this.props.visualizationConfigurationFactory}
                assessmentsProvider={this.props.assessmentsProvider}
                dropdownClickHandler={this.props.dropdownClickHandler}
                clickHandlerFactory={this.props.clickHandlerFactory}
                assessmentInstanceTableHandler={this.props.assessmentInstanceTableHandler}
                issuesSelection={this.props.issuesSelection}
                reportGenerator={this.props.reportGenerator}
                issuesTableHandler={this.props.issuesTableHandler}
                rightPanelConfiguration={selectedDetailsRightPanelConfiguration}
                switcherNavConfiguration={selectedDetailsViewSwitcherNavConfiguration}
                issueTrackerPath={issueTrackerPath}
                userConfigurationStoreData={storeState.userConfigurationStoreData}
            />
        );
    }

    private hasStores(): boolean {
        return this.props.deps !== null && this.props.deps.storesHub !== null && this.props.deps.storesHub.hasStores();
    }
}

export const DetailsView = withStoreSubscription<DetailsViewContainerProps, DetailsViewContainerState>(DetailsViewContainer);

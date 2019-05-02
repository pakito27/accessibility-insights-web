// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import * as _ from 'lodash';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { ISelection } from 'office-ui-fabric-react/lib/DetailsList';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

import * as Markup from '../../assessments/markup';
import { VisualizationToggle } from '../../common/components/visualization-toggle';
import { VisualizationConfiguration, VisualizationConfigurationFactory } from '../../common/configs/visualization-configuration-factory';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { UserConfigurationStoreData } from '../../common/types/store-data/user-configuration-store';
import { VisualizationType } from '../../common/types/visualization-type';
import { DecoratedAxeNodeResult } from '../../injected/scanner-utils';
import { RuleResult, ScanResults } from '../../scanner/iruleresults';
import { DictionaryStringTo } from '../../types/common-types';
import { ReportGenerator } from '../reports/report-generator';
import { ExportDialog, ExportDialogDeps } from './export-dialog';
import { IssuesDetailsList } from './issues-details-list';
import { IssuesDetailsPane, IssuesDetailsPaneDeps } from './Issues-details-pane';
import { IssuesTableHandler } from './issues-table-handler';
import { AndroidResultsBridge } from '../android-results-bridge';

export type IssuesTableDeps = IssuesDetailsPaneDeps & ExportDialogDeps;

export interface IssuesTableProps {
    deps: IssuesTableDeps;
    title: string;
    issuesTableHandler: IssuesTableHandler;
    violations: RuleResult[];
    selectedIdToRuleResultMap: DictionaryStringTo<DecoratedAxeNodeResult>;
    issuesEnabled: boolean;
    issuesSelection: ISelection;
    issueTrackerPath: string;
    pageTitle: string;
    pageUrl: string;
    scanning: boolean;
    toggleClickHandler: (event) => void;
    visualizationConfigurationFactory: VisualizationConfigurationFactory;
    featureFlags: FeatureFlagStoreData;
    scanResult: ScanResults;
    reportGenerator: ReportGenerator;
    userConfigurationStoreData: UserConfigurationStoreData;
}

export interface IssuesTableState {
    isExportDialogOpen: boolean;
    exportDescription: string;
    exportName: string;
    exportDataWithPlaceholder: string;
    exportData: string;
}

export class IssuesTable extends React.Component<IssuesTableProps, IssuesTableState> {
    private configuration: VisualizationConfiguration;
    public static readonly exportTextareaLabel: string = 'Provide result description';
    public static readonly exportInstructions: string = 'Optional: please describe the result (it will be saved in the report).';

    constructor(props: IssuesTableProps) {
        super(props);
        this.configuration = props.visualizationConfigurationFactory.getConfiguration(VisualizationType.Issues);
        this.state = {
            isExportDialogOpen: false,
            exportDescription: '',
            exportName: '',
            exportDataWithPlaceholder: '',
            exportData: '',
            waiting: true,
        };
    }

    public render(): JSX.Element {
        return (
            <div className="issues-table">
                <h1>{this.props.title}</h1>
                {this.renderContent()}
            </div>
        );
    }

    private renderContent(): JSX.Element {
        if (this.props.issuesEnabled == null) {
            return this.renderSpinner('Loading...');
        }

        return (
            <div>
                {this.renderCommandBar()}
                {this.renderExportDialog()}
                {this.renderComponent()}
            </div>
        );
    }

    private renderCommandBar(): JSX.Element {
        return (
            <div className="details-view-command-bar">
                {this.renderExportButton()}
                {this.renderOpenButton()}
            </div>
        );
    }

    private renderExportButton(): JSX.Element {
        const shouldShowButton = this.props.issuesEnabled && !this.props.scanning;
        if (shouldShowButton) {
            return (
                <ActionButton iconProps={{ iconName: 'Add' }} onClick={this.onExportButtonClick}>
                    Get API results
                </ActionButton>
            );
        } else {
            return null;
        }
    }

    private renderOpenButton(): JSX.Element {
        const shouldShowButton = this.props.issuesEnabled && !this.props.scanning;
        if (shouldShowButton) {
            return (
                <ActionButton iconProps={{ iconName: 'Add' }} onClick={this.onOpenButtonClick}>
                    Open results file
                </ActionButton>
            );
        } else {
            return null;
        }
    }

    private renderExportDialog(): JSX.Element {
        return (
            <ExportDialog
                deps={this.props.deps}
                isOpen={this.state.isExportDialogOpen}
                fileName={this.state.exportName}
                description={this.state.exportDescription}
                html={this.state.exportData}
                onClose={this.onDismissExportDialog}
                onDescriptionChange={this.onExportDescriptionChange}
                exportResultsType="AutomatedChecks"
            />
        );
    }

    private renderComponent(): JSX.Element {
        if ((this.state as any).waiting) {
            return this.renderDisabledMessage();
        }

        if ((this.state as any).scanning) {
            return this.renderSpinner('Loading data...');
        }

        return this.renderDetails();
    }

    private renderToggle(): JSX.Element {
        return (
            <VisualizationToggle
                label={this.configuration.displayableData.toggleLabel}
                checked={this.props.issuesEnabled}
                disabled={this.props.scanning}
                onClick={this.props.toggleClickHandler}
                className="automated-checks-details-view-toggle"
                visualizationName={this.configuration.displayableData.title}
            />
        );
    }

    private renderSpinner(label: string): JSX.Element {
        return <Spinner className="details-view-spinner" size={SpinnerSize.large} label={label} />;
    }

    private renderDisabledMessage(): JSX.Element {
        return (
            <div className="details-disabled-message" role="alert">
                Choose an option above to see results.
            </div>
        );
    }

    private renderDetails(): JSX.Element {
        return (
            <div className="issues-table-details">
                <IssuesDetailsList
                    violations={(this.state as any).violations}
                    issuesTableHandler={this.props.issuesTableHandler}
                    issuesSelection={this.props.issuesSelection}
                />
                <div className="issue-detail-outer-container ms-Fabric">{this.getIssueDetailPane()}</div>
            </div>
        );
    }

    private getIssueDetailPane(): JSX.Element {
        return (
            <IssuesDetailsPane
                deps={this.props.deps}
                selectedIdToRuleResultMap={this.props.selectedIdToRuleResultMap}
                pageTitle={this.props.pageTitle}
                pageUrl={this.props.pageUrl}
                issueTrackerPath={this.props.issueTrackerPath}
                featureFlagData={this.props.featureFlags}
                userConfigurationStoreData={this.props.userConfigurationStoreData}
            />
        );
    }

    private descriptionPlaceholder: string = 'd68d50a0-8249-464d-b2fd-709049c89ee4';

    @autobind
    private onExportButtonClick(): void {
        this.setState({ ...this.state, scanning: true, waiting: false } as any);
        AndroidResultsBridge.GetAxeResults(res => {
            const violations = AndroidResultsBridge.AndroidToWebResults(JSON.parse(res));
            this.setState({ ...this.state, violations: violations, scanning: false } as any);
        });
    }

    @autobind
    private onOpenButtonClick(): void {
        const selectedPath = AndroidResultsBridge.OpenFilePicker();
        const android = AndroidResultsBridge.ReadAndroidFile(selectedPath);
        const newViolations = AndroidResultsBridge.AndroidToWebResults(android);

        this.setState({ ...this.state, violations: newViolations, scanning: false, waiting: false } as any);
    }

    @autobind
    private onDismissExportDialog(): void {
        this.setState({ isExportDialogOpen: false });
    }

    @autobind
    private onExportDescriptionChange(value: string): void {
        const exportData = this.state.exportDataWithPlaceholder.replace(this.descriptionPlaceholder, _.escape(value));
        this.setState({ exportDescription: value, exportData: exportData });
    }
}

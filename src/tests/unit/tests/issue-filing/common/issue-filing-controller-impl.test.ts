// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseStore } from 'common/base-store';
import { BrowserAdapter } from 'common/browser-adapters/browser-adapter';
import { CreateIssueDetailsTextData } from 'common/types/create-issue-details-text-data';
import { ToolData } from 'common/types/store-data/unified-data-interface';
import {
    IssueFilingServicePropertiesMap,
    UserConfigurationStoreData,
} from 'common/types/store-data/user-configuration-store';
import { IssueFilingControllerImpl } from 'issue-filing/common/issue-filing-controller-impl';
import { IssueFilingServiceProvider } from 'issue-filing/issue-filing-service-provider';
import { IssueFilingService } from 'issue-filing/types/issue-filing-service';
import { Mock } from 'typemoq';

describe('IssueFilingControllerImpl', () => {
    it('fileIssue', async () => {
        const serviceKey = 'test-service';
        const issueData = {
            targetApp: {},
        } as CreateIssueDetailsTextData;
        const toolData: ToolData = {
            scanEngineProperties: {
                name: 'engine-name',
                version: 'engine-version',
            },
            applicationProperties: {
                name: 'app-name',
                version: 'app-version',
                environmentName: 'environmentName',
            },
        };
        const testUrl = 'test-url';
        const map: IssueFilingServicePropertiesMap = {
            [serviceKey]: {
                repository: testUrl,
            },
        };
        const serviceConfig = { bugServicePropertiesMap: map } as UserConfigurationStoreData;

        const browserAdapterMock = Mock.ofType<BrowserAdapter>();
        const issueFilingServiceMock = Mock.ofType<IssueFilingService>();
        issueFilingServiceMock
            .setup(service =>
                service.fileIssue(
                    browserAdapterMock.object.createActiveTab,
                    map,
                    issueData,
                    toolData,
                ),
            )
            .returns(() => Promise.resolve());

        const providerMock = Mock.ofType<IssueFilingServiceProvider>();
        providerMock
            .setup(provider => provider.forKey(serviceKey))
            .returns(() => issueFilingServiceMock.object);

        const storeMock = Mock.ofType<BaseStore<UserConfigurationStoreData>>();
        storeMock.setup(store => store.getState()).returns(() => serviceConfig);

        const testSubject = new IssueFilingControllerImpl(
            browserAdapterMock.object.createActiveTab,
            providerMock.object,
            storeMock.object,
        );

        await expect(testSubject.fileIssue(serviceKey, issueData, toolData)).resolves.toBe(
            undefined,
        );

        browserAdapterMock.verifyAll();
    });
});

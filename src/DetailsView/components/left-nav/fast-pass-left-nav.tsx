// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { NamedSFC } from '../../../common/react/named-sfc';
import { VisualizationType } from '../../../common/types/visualization-type';
import { NavLinkHandler } from './nav-link-handler';
import { VisualizationBasedLeftNav, VisualizationBasedLeftNavDeps } from './visualization-based-left-nav';

export type FastPassLeftNavDeps = {
    navLinkHandler: NavLinkHandler;
} & VisualizationBasedLeftNavDeps;
export type FastPassLeftNavProps = {
    deps: FastPassLeftNavDeps;
    selectedKey: string;
};

export const FastPassLeftNav = NamedSFC<FastPassLeftNavProps>('FastPassLeftNav', props => {
    const { deps } = props;

    const { navLinkHandler } = deps;

    const tests = [VisualizationType.Issues];

    return <VisualizationBasedLeftNav {...props} onLinkClick={navLinkHandler.onFastPassTestClick} visualizations={tests} />;
});

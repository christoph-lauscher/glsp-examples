/********************************************************************************
 * Copyright (c) 2022-2023 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import {
    BindingTarget,
    CommandPaletteActionProvider,
    ContextMenuItemProvider,
    DiagramConfiguration,
    EdgeCreationChecker,
    GLSPServer,
    GModelDiagramModule,
    InstanceMultiBinding,
    LabelEditValidator,
    ModelValidator,
    MultiBinding,
    NavigationTargetProvider,
    NavigationTargetResolver,
    OperationHandlerConstructor,
    ServerModule,
    SourceModelStorage
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import {
    CreateContributesToGoalHandler,
    CreateContributesToSoftSustainabilityGoalHandler,
    CreateContainsTargetHandler,
    CreateIntegratesCapabilityHandler,
    CreateIntegratesDomainGoalHandler,
    CreateMetamodelNodeHandler,
    CreateSoThatSoftGoalHandler,
    CreateSoThatTaskHandler,
    CreateSupportsTargetHandler,
    CreateWantsCapabilityHandler,
    CreateWantsTaskHandler
} from './handler/create-metamodel-element-handlers';
import { WorkflowLabelEditValidator } from './labeledit/workflow-label-edit-validator';
import { WorkflowModelValidator } from './marker/workflow-model-validator';
import { WorkflowNavigationTargetResolver } from './model/workflow-navigation-target-resolver';
import { NextNodeNavigationTargetProvider } from './provider/next-node-navigation-target-provider';
import { PreviousNodeNavigationTargetProvider } from './provider/previous-node-navigation-target-provider';
import { WorkflowCommandPaletteActionProvider } from './provider/workflow-command-palette-action-provider';
import { WorkflowContextMenuItemProvider } from './provider/workflow-context-menu-item-provider';
import { WorkflowDiagramConfiguration } from './workflow-diagram-configuration';
import { WorkflowEdgeCreationChecker } from './workflow-edge-creation-checker';
import { WorkflowGLSPServer } from './workflow-glsp-server';

@injectable()
export class WorkflowServerModule extends ServerModule {
    protected override bindGLSPServer(): BindingTarget<GLSPServer> {
        return WorkflowGLSPServer;
    }
}

@injectable()
export class WorkflowDiagramModule extends GModelDiagramModule {
    constructor(public bindSourceModelStorage: () => BindingTarget<SourceModelStorage>) {
        super();
    }

    get diagramType(): string {
        return 'workflow-diagram';
    }

    protected override configureOperationHandlers(binding: InstanceMultiBinding<OperationHandlerConstructor>): void {
        super.configureOperationHandlers(binding);
        binding.add(CreateMetamodelNodeHandler);
        binding.add(CreateWantsTaskHandler);
        binding.add(CreateWantsCapabilityHandler);
        binding.add(CreateSoThatTaskHandler);
        binding.add(CreateContributesToGoalHandler);
        binding.add(CreateSoThatSoftGoalHandler);
        binding.add(CreateContributesToSoftSustainabilityGoalHandler);
        binding.add(CreateSupportsTargetHandler);
        binding.add(CreateIntegratesDomainGoalHandler);
        binding.add(CreateIntegratesCapabilityHandler);
        binding.add(CreateContainsTargetHandler);
    }

    protected bindDiagramConfiguration(): BindingTarget<DiagramConfiguration> {
        return WorkflowDiagramConfiguration;
    }

    protected override bindNavigationTargetResolver(): BindingTarget<NavigationTargetResolver> | undefined {
        return WorkflowNavigationTargetResolver;
    }

    protected override bindContextMenuItemProvider(): BindingTarget<ContextMenuItemProvider> | undefined {
        return WorkflowContextMenuItemProvider;
    }

    protected override bindCommandPaletteActionProvider(): BindingTarget<CommandPaletteActionProvider> | undefined {
        return WorkflowCommandPaletteActionProvider;
    }

    protected override bindLabelEditValidator(): BindingTarget<LabelEditValidator> | undefined {
        return WorkflowLabelEditValidator;
    }

    protected override bindModelValidator(): BindingTarget<ModelValidator> | undefined {
        return WorkflowModelValidator;
    }

    protected override configureNavigationTargetProviders(binding: MultiBinding<NavigationTargetProvider>): void {
        super.configureNavigationTargetProviders(binding);
        binding.add(NextNodeNavigationTargetProvider);
        binding.add(PreviousNodeNavigationTargetProvider);
    }

    protected override bindEdgeCreationChecker(): BindingTarget<EdgeCreationChecker> | undefined {
        return WorkflowEdgeCreationChecker;
    }
}

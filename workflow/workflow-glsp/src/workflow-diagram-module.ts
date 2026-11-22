/********************************************************************************
 * Copyright (c) 2019-2024 EclipseSource and others.
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
    ConsoleLogger,
    ContainerConfiguration,
    DEFAULT_ALIGNABLE_ELEMENT_FILTER,
    DefaultTypes,
    DeleteElementContextMenuItemProvider,
    FeatureModule,
    GCompartment,
    GCompartmentView,
    GEdge,
    GGraph,
    GNode,
    GLSPProjectionView,
    GLabel,
    GLabelView,
    IHelperLineOptions,
    LogLevel,
    RectangularNodeView,
    RevealNamedElementActionProvider,
    TYPES,
    bindAsService,
    bindOrRebind,
    configureDefaultModelElements,
    configureModelElement,
    debugModule,
    editLabelFeature,
    gridModule,
    helperLineModule,
    initializeDiagramContainer,
    overrideModelElement
} from '@eclipse-glsp/client';
import 'balloon-css/balloon.min.css';
import { Container } from 'inversify';
import 'sprotty/css/edit-label.css';
import '../css/diagram.css';
import { WorkflowSnapper } from './workflow-snapper';
import { WorkflowStartup } from './workflow-startup';
import { WorkflowEdgeView } from './workflow-views';

const METAMODEL_NODE_TYPES = [
    'Role',
    'Task',
    'Capability',
    'Hard_Goal',
    'Soft_Goal',
    'Hard_Sustainability_Goal',
    'Soft_Sustainability_Goal',
    'UNSustainable_Development_Goal',
    'UNSustainable_Development_Goal_Target',
    'Sustainability_Capability'
];

const METAMODEL_EDGE_TYPES = [
    'wants_task',
    'wants_capability',
    'so_that_task',
    'contributes_to_goal',
    'so_that_soft_goal',
    'contributes_to_soft_sustainability_goal',
    'supports_target',
    'integrates_domain_goal',
    'integrates_capability',
    'contains_target'
];

export const workflowDiagramModule = new FeatureModule(
    (bind, unbind, isBound, rebind) => {
        const context = { bind, unbind, isBound, rebind };

        bindOrRebind(context, TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        bindOrRebind(context, TYPES.LogLevel).toConstantValue(LogLevel.warn);
        bindAsService(context, TYPES.ICommandPaletteActionProvider, RevealNamedElementActionProvider);
        bindAsService(context, TYPES.IContextMenuItemProvider, DeleteElementContextMenuItemProvider);

        configureDefaultModelElements(context);
        METAMODEL_NODE_TYPES.forEach(type => configureModelElement(context, type, GNode, RectangularNodeView));
        configureModelElement(context, 'label:metamodel', GLabel, GLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, 'label:metamodel-display', GLabel, GLabelView);
        configureModelElement(context, 'label:metamodel-type', GLabel, GLabelView);
        configureModelElement(context, 'label:sdg-level', GLabel, GLabelView);
        overrideModelElement(context, DefaultTypes.EDGE, GEdge, WorkflowEdgeView);
        METAMODEL_EDGE_TYPES.forEach(type => configureModelElement(context, type, GEdge, WorkflowEdgeView));
        overrideModelElement(context, DefaultTypes.GRAPH, GGraph, GLSPProjectionView);
        configureModelElement(context, 'label:heading', GLabel, GLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, 'comp:comp', GCompartment, GCompartmentView);

        bind<IHelperLineOptions>(TYPES.IHelperLineOptions).toDynamicValue(ctx => {
            const options: IHelperLineOptions = {};
            options.alignmentElementFilter = element => DEFAULT_ALIGNABLE_ELEMENT_FILTER(element) && !(element instanceof GCompartment);
            return options;
        });

        bindAsService(context, TYPES.IDiagramStartup, WorkflowStartup);
        bindOrRebind(context, TYPES.ISnapper).to(WorkflowSnapper);
    },
    { featureId: Symbol('workflowDiagram') }
);

export function createWorkflowDiagramContainer(...containerConfiguration: ContainerConfiguration): Container {
    return initializeWorkflowDiagramContainer(new Container(), ...containerConfiguration);
}

export function initializeWorkflowDiagramContainer(container: Container, ...containerConfiguration: ContainerConfiguration): Container {
    return initializeDiagramContainer(
        container,
        helperLineModule,
        gridModule,
        debugModule,
        workflowDiagramModule,
        ...containerConfiguration
    );
}

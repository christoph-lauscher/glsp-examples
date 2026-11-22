/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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
import { WorkflowLanguage } from '@eclipse-glsp-examples/workflow-theia/lib/common/workflow-language';
import { GLSPActionDispatcher, GModelRoot } from '@eclipse-glsp/client';
import { getDiagramWidget, GLSPDiagramWidget } from '@eclipse-glsp/theia-integration';
import { ApplicationShell } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';

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

@injectable()
export class WorkflowDiagramProvider {
    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    getWorkflowWidget(): GLSPDiagramWidget | undefined {
        return this.shell.widgets.find(
            widget =>
                getDiagramWidget(widget) instanceof GLSPDiagramWidget &&
                getDiagramWidget(widget)?.diagramType === WorkflowLanguage.diagramType
        ) as GLSPDiagramWidget;
    }

    awaitModelUpdate(): Promise<void> {
        return new Promise(resolve => {
            const widget = this.getWorkflowWidget();
            if (widget) {
                widget.editorContext.onModelRootChanged(() => {
                    resolve();
                });
            }
        });
    }

    getActionDispatcher(): GLSPActionDispatcher | undefined {
        const widget = this.getWorkflowWidget();
        return widget?.actionDispatcher;
    }

    getModelState(): GModelRoot | undefined {
        const widget = this.getWorkflowWidget();
        return widget?.editorContext.modelRoot;
    }

    getModelDescription(): any {
        const modelRoot = this.getModelState();
        if (!modelRoot) {
            return {};
        }

        function processElement(node: any): any | null {
            if (!METAMODEL_NODE_TYPES.includes(node.type) && !METAMODEL_EDGE_TYPES.includes(node.type)) {
                // eslint-disable-next-line no-null/no-null
                return null;
            }

            // Process edge type directly
            if (METAMODEL_EDGE_TYPES.includes(node.type)) {
                return {
                    id: node.id,
                    type: node.type,
                    sourceId: node.sourceId,
                    targetId: node.targetId,
                    label: node.children?.find(
                        (child: any) => child.type === 'label:metamodel' || child.type === 'label:sdg-level'
                    )?.text
                };
            }

            // Read the displayed metamodel label and its domain attributes.
            const newNode = {
                type: node.type,
                id: node.id,
                label: node.children?.find(
                    (child: any) =>
                        child.type === 'label:metamodel' ||
                        child.type === 'label:sdg-level' ||
                        child.type === 'label:metamodel-display'
                )?.text,
                position: node.position,
                size: node.size,
                dimension: node.dimension,
                level: node.level
            };
            return newNode;
        }
        const convertedModel = {
            id: modelRoot.id,
            type: modelRoot.type,
            // eslint-disable-next-line no-null/no-null
            children: modelRoot.children.map(processElement).filter((node: any) => node !== null)
        };
        return convertedModel;
    }
}

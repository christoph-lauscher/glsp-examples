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
import { CommandPaletteActionProvider, CreateEdgeOperation, CreateNodeOperation, DeleteElementOperation, GLabel, GModelElement, GNode, LabeledAction, ModelState, Point } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { ModelTypes } from '../util/model-types';

const NODE_LABELS = new Map<string, string>([
    [ModelTypes.ROLE, 'Role'],
    [ModelTypes.TASK_ENTITY, 'Task'],
    [ModelTypes.CAPABILITY, 'Capability'],
    [ModelTypes.HARD_GOAL, 'Hard Goal'],
    [ModelTypes.SOFT_GOAL, 'Soft Goal'],
    [ModelTypes.HARD_SUSTAINABILITY_GOAL, 'Hard Sustainability Goal'],
    [ModelTypes.SOFT_SUSTAINABILITY_GOAL, 'Soft Sustainability Goal'],
    [ModelTypes.UN_SDG, 'UN Sustainable Development Goal'],
    [ModelTypes.UN_SDG_TARGET, 'UN Sustainable Development Goal Target'],
    [ModelTypes.SUSTAINABILITY_CAPABILITY, 'Sustainability Capability']
]);

@injectable()
export class WorkflowCommandPaletteActionProvider extends CommandPaletteActionProvider {
    @inject(ModelState)
    protected override modelState: ModelState;

    getPaletteActions(selectedElementIds: string[], selectedElements: GModelElement[], position: Point, _args?: object): LabeledAction[] {
        if (this.modelState.isReadonly) {
            return [];
        }

        const location = position ?? Point.ORIGIN;
        const actions: LabeledAction[] = ModelTypes.METAMODEL_NODE_TYPES.map(type => ({
            label: `Create ${NODE_LABELS.get(type) ?? type}`,
            actions: [CreateNodeOperation.create(type, { location })],
            icon: 'fa-plus-square'
        }));

        if (selectedElements.length === 2) {
            const [source, target] = selectedElements;
            if (source instanceof GNode && target instanceof GNode) {
                for (const edge of ModelTypes.METAMODEL_EDGES) {
                    if (edge.sourceTypes.includes(source.type) && edge.targetTypes.includes(target.type)) {
                        actions.push({
                            label: `Create ${edge.label}: ${this.getLabel(source)} to ${this.getLabel(target)}`,
                            actions: [
                                CreateEdgeOperation.create({
                                    elementTypeId: edge.id,
                                    sourceElementId: source.id,
                                    targetElementId: target.id
                                })
                            ],
                            icon: 'fa-plus-square'
                        });
                    }
                }
            }
        }

        const label = selectedElementIds.length === 1 ? 'Delete' : 'Delete All';
        actions.push({ label, actions: [DeleteElementOperation.create(selectedElementIds)], icon: 'fa-minus-square' });
        return actions;
    }

    protected getLabel(node: GNode): string {
        return node.children.find((child): child is GLabel => child instanceof GLabel)?.text ?? node.id;
    }
}

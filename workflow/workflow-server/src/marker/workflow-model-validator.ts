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
import { AbstractModelValidator, GModelElement, Marker, MarkerKind, ModelState } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { MetamodelNode } from '../metamodel-model';
import { ModelTypes } from '../util/model-types';

@injectable()
export class WorkflowModelValidator extends AbstractModelValidator {
    @inject(ModelState)
    protected readonly modelState: ModelState;

    override doLiveValidation(_element: GModelElement): Marker[] {
        return [];
    }

    override doBatchValidation(element: GModelElement): Marker[] {
        if (element === this.modelState.root) {
            const goalCount = this.modelState.index.getElements(ModelTypes.UN_SDG).length;
            if (goalCount !== 1) {
                return [
                    {
                        kind: MarkerKind.ERROR,
                        description: `A model must contain exactly one UN Sustainable Development Goal (found ${goalCount}).`,
                        elementId: element.id,
                        label: 'Invalid UN SDG count'
                    }
                ];
            }
        }
        if (!(element instanceof MetamodelNode)) {
            return [];
        }

        if (element.type === ModelTypes.HARD_SUSTAINABILITY_GOAL) {
            const integrationCount = this.modelState.index
                .getOutgoingEdges(element)
                .filter(edge => edge.type === ModelTypes.INTEGRATES_CAPABILITY).length;
            if (integrationCount !== 1) {
                return [
                    {
                        kind: MarkerKind.ERROR,
                        description: `A Hard Sustainability Goal must integrate exactly one Sustainability Capability (found ${integrationCount}).`,
                        elementId: element.id,
                        label: 'Invalid capability integration count'
                    }
                ];
            }
        }
        if (element.type === ModelTypes.ROLE) {
            const outgoingTypes = this.modelState.index.getOutgoingEdges(element).map(edge => edge.type);
            return [
                ...this.missingRoleRelationship(outgoingTypes, ModelTypes.WANTS_TASK, 'Task', element.id),
                ...this.missingRoleRelationship(outgoingTypes, ModelTypes.WANTS_CAPABILITY, 'Capability', element.id)
            ];
        }
        return [];
    }

    protected missingRoleRelationship(edgeTypes: string[], relationType: string, label: string, elementId: string): Marker[] {
        if (edgeTypes.includes(relationType)) {
            return [];
        }
        return [
            {
                kind: MarkerKind.ERROR,
                description: `A Role must be connected to at least one ${label}.`,
                elementId,
                label: `Missing ${label} relationship`
            }
        ];
    }
}

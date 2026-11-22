/**
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
 */
import {
    CreateNodeOperation,
    GEdge,
    GEdgeBuilder,
    GLabel,
    GLabelBuilder,
    GModelCreateEdgeOperationHandler,
    GModelElement,
    Point
} from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { MetamodelNode } from '../metamodel-model';
import { ModelTypes } from '../util/model-types';
import { CreateWorkflowNodeOperationHandler } from './create-workflow-node-operation-handler';

@injectable()
export class CreateMetamodelNodeHandler extends CreateWorkflowNodeOperationHandler {
    elementTypeIds = ModelTypes.METAMODEL_NODE_TYPES;
    label = 'Metamodel element';

    override createNode(operation: CreateNodeOperation, relativeLocation?: Point): MetamodelNode {
        const type = operation.elementTypeId;
        if (!this.elementTypeIds.includes(type)) {
            throw new Error(`Unsupported metamodel node type '${type}'.`);
        }
        if (type === ModelTypes.UN_SDG && this.modelState.index.getElements(ModelTypes.UN_SDG).length > 0) {
            throw new Error('A model can contain exactly one UN Sustainable Development Goal.');
        }
        const builder = MetamodelNode.builder()
            .type(type)
            .position(relativeLocation ?? Point.ORIGIN)
            .addCssClass('metamodel-element');

        if (type === ModelTypes.ROLE) {
            builder.dimension('WHO');
        } else if (type === ModelTypes.CAPABILITY) {
            builder.dimension('WHAT');
        } else if (type === ModelTypes.TASK_ENTITY) {
            builder.dimension('WHAT');
        } else if (
            type === ModelTypes.HARD_GOAL ||
            type === ModelTypes.SOFT_GOAL ||
            type === ModelTypes.HARD_SUSTAINABILITY_GOAL ||
            type === ModelTypes.SOFT_SUSTAINABILITY_GOAL
        ) {
            builder.dimension('WHAT');
        }

        if (type === ModelTypes.UN_SDG_TARGET) {
            builder.level('Strong');
        }
        builder.args(operation.args);

        const hasName = operation.args && Object.prototype.hasOwnProperty.call(operation.args, 'name');
        const name = operation.args?.name;
        if (hasName && (!ModelTypes.NAMED_NODE_TYPES.includes(type) || typeof name !== 'string' || name.trim().length === 0)) {
            throw new Error(`'${type}' does not accept a name argument or the supplied name is empty.`);
        }
        const requestedLevel = operation.args?.level;
        const defaultName =
            type === ModelTypes.UN_SDG_TARGET
                ? requestedLevel === 'Strong' || requestedLevel === 'Moderate' || requestedLevel === 'Indirect'
                    ? requestedLevel
                    : 'Strong'
                : type.replace(/_/g, ' ');
        if (ModelTypes.NAMED_NODE_TYPES.includes(type)) {
            builder.name(typeof name === 'string' ? name.trim() : defaultName);
        } else {
            builder.displayLabel(defaultName);
        }
        return builder.build();
    }
}

@injectable()
abstract class CreateMetamodelEdgeHandler extends GModelCreateEdgeOperationHandler {
    abstract readonly relationType: string;
    abstract override label: string;

    get elementTypeIds(): string[] {
        return [this.relationType];
    }

    createEdge(source: GModelElement, target: GModelElement): GEdge {
        const definition = ModelTypes.METAMODEL_EDGES.find(edge => edge.id === this.relationType);
        if (!definition || !definition.sourceTypes.includes(source.type) || !definition.targetTypes.includes(target.type)) {
            throw new Error(`Invalid endpoints for '${this.relationType}': '${source.type}' -> '${target.type}'.`);
        }
        if (
            this.relationType === ModelTypes.INTEGRATES_CAPABILITY &&
            source.type === ModelTypes.HARD_SUSTAINABILITY_GOAL &&
            this.modelState.index.getOutgoingEdges(source).some(edge => edge.type === ModelTypes.INTEGRATES_CAPABILITY)
        ) {
            throw new Error('A Hard Sustainability Goal can integrate exactly one Sustainability Capability.');
        }

        return new GEdgeBuilder(GEdge)
            .type(this.relationType)
            .sourceId(source.id)
            .targetId(target.id)
            .add(new GLabelBuilder(GLabel).type(ModelTypes.LABEL_METAMODEL).text(this.label).build())
            .build();
    }
}

@injectable()
export class CreateWantsTaskHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.WANTS_TASK;
    label = 'wants';
}

@injectable()
export class CreateWantsCapabilityHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.WANTS_CAPABILITY;
    label = 'wants';
}

@injectable()
export class CreateSoThatTaskHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.SO_THAT_TASK;
    label = 'so_that';
}

@injectable()
export class CreateContributesToGoalHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.CONTRIBUTES_TO_GOAL;
    label = 'contributes_to';
}

@injectable()
export class CreateSoThatSoftGoalHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.SO_THAT_SOFT_GOAL;
    label = 'so_that';
}

@injectable()
export class CreateContributesToSoftSustainabilityGoalHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.CONTRIBUTES_TO_SOFT_SUSTAINABILITY_GOAL;
    label = 'contributes_to';
}

@injectable()
export class CreateSupportsTargetHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.SUPPORTS_TARGET;
    label = 'supports';
}

@injectable()
export class CreateIntegratesDomainGoalHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.INTEGRATES_DOMAIN_GOAL;
    label = 'integrates';
}

@injectable()
export class CreateIntegratesCapabilityHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.INTEGRATES_CAPABILITY;
    label = 'integrates';
}

@injectable()
export class CreateContainsTargetHandler extends CreateMetamodelEdgeHandler {
    readonly relationType = ModelTypes.CONTAINS_TARGET;
    label = 'contains';
}

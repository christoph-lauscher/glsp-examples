/********************************************************************************
 * Copyright (c) 2022-2024 STMicroelectronics and others.
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
import { EdgeTypeHint, ShapeTypeHint } from '@eclipse-glsp/protocol';
import { DiagramConfiguration, GEdge, GLabel, GModelElementConstructor, ServerLayoutKind, getDefaultMapping } from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { MetamodelNode } from './metamodel-model';
import { ModelTypes as types } from './util/model-types';

@injectable()
export class WorkflowDiagramConfiguration implements DiagramConfiguration {
    get typeMapping(): Map<string, GModelElementConstructor> {
        const mapping = getDefaultMapping();
        mapping.set(types.LABEL_METAMODEL, GLabel);
        mapping.set(types.LABEL_METAMODEL_DISPLAY, GLabel);
        mapping.set(types.LABEL_SDG_LEVEL, GLabel);
        types.METAMODEL_NODE_TYPES.forEach(type => mapping.set(type, MetamodelNode));
        types.METAMODEL_EDGE_TYPES.forEach(type => mapping.set(type, GEdge));
        return mapping;
    }

    get shapeTypeHints(): ShapeTypeHint[] {
        return types.METAMODEL_NODE_TYPES.map(elementTypeId => ({
            elementTypeId,
            repositionable: true,
            deletable: true,
            resizable: true,
            reparentable: true
        }));
    }

    get edgeTypeHints(): EdgeTypeHint[] {
        return types.METAMODEL_EDGES.map(edge => ({
            elementTypeId: edge.id,
            dynamic: true,
            repositionable: true,
            deletable: true,
            routable: true,
            sourceElementTypeIds: edge.sourceTypes,
            targetElementTypeIds: edge.targetTypes
        }));
    }

    layoutKind = ServerLayoutKind.MANUAL;
    needsClientLayout = true;
    animatedUpdate = true;
}

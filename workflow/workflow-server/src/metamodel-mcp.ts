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
import { GLabel, GModelElement } from '@eclipse-glsp/server';
import { ElementTypeEntry, ElementTypesProvider, MarkdownMcpModelSerializer, McpLabelProvider } from '@eclipse-glsp/server-mcp/lib/common';
import { inject, injectable } from 'inversify';
import { MetamodelNode } from './metamodel-model';
import { ModelTypes } from './util/model-types';

const NODE_TYPE_ENTRIES: ElementTypeEntry[] = [
    { id: ModelTypes.ROLE, label: 'Role', description: 'WHO dimension; has a name and may want tasks and capabilities.', acceptsText: true },
    {
        id: ModelTypes.TASK_ENTITY,
        label: 'Task',
        description: 'WHAT or WHY dimension; supply args.dimension as WHAT or WHY. Has a name and may contribute to goals.',
        acceptsText: true
    },
    { id: ModelTypes.CAPABILITY, label: 'Capability', description: 'WHAT dimension; has a name and may support tasks and goals.', acceptsText: true },
    {
        id: ModelTypes.HARD_GOAL,
        label: 'Hard Goal',
        description: 'WHAT or WHY dimension; supply args.dimension as WHAT or WHY. May have so-that links to soft goals.',
        acceptsText: true
    },
    {
        id: ModelTypes.SOFT_GOAL,
        label: 'Soft Goal',
        description: 'WHAT or WHY dimension; supply args.dimension as WHAT or WHY.',
        acceptsText: true
    },
    {
        id: ModelTypes.HARD_SUSTAINABILITY_GOAL,
        label: 'Hard Sustainability Goal',
        description: 'WHAT or WHY dimension; supply args.dimension as WHAT or WHY. Integrates exactly one Sustainability Capability and may support UN SDG targets.',
        acceptsText: true
    },
    {
        id: ModelTypes.SOFT_SUSTAINABILITY_GOAL,
        label: 'Soft Sustainability Goal',
        description: 'WHAT or WHY dimension; supply args.dimension as WHAT or WHY. May contribute to itself or another soft sustainability goal.',
        acceptsText: true
    },
    {
        id: ModelTypes.UN_SDG,
        label: 'UN Sustainable Development Goal',
        description: 'Aggregates UN Sustainable Development Goal targets.'
    },
    {
        id: ModelTypes.UN_SDG_TARGET,
        label: 'UN Sustainable Development Goal Target',
        description: 'Has a Strong, Moderate, or Indirect level; supply args.level to choose the level.'
    },
    {
        id: ModelTypes.SUSTAINABILITY_CAPABILITY,
        label: 'Sustainability Capability',
        description: 'Can integrate hard or soft sustainability goals.'
    }
];

@injectable()
export class MetamodelElementTypesProvider implements ElementTypesProvider {
    get(): { nodeTypes: ElementTypeEntry[]; edgeTypes: ElementTypeEntry[] } {
        return {
            nodeTypes: NODE_TYPE_ENTRIES.map(entry => ({ ...entry })),
            edgeTypes: ModelTypes.METAMODEL_EDGES.map(edge => ({
                id: edge.id,
                label: edge.label,
                description: edge.description,
                sourceTypes: [...edge.sourceTypes],
                targetTypes: [...edge.targetTypes]
            }))
        };
    }
}

@injectable()
export class MetamodelLabelProvider implements McpLabelProvider {
    getLabel(element: GModelElement): GLabel | undefined {
        return findLabel(element);
    }
}

function findLabel(element: GModelElement): GLabel | undefined {
    for (const child of element.children) {
        if (child instanceof GLabel) {
            return child;
        }
        const label = findLabel(child);
        if (label) {
            return label;
        }
    }
    return undefined;
}

@injectable()
export class MetamodelModelSerializer extends MarkdownMcpModelSerializer {
    @inject(McpLabelProvider)
    protected labelProvider: McpLabelProvider;

    protected override prepareElement(element: GModelElement): Record<string, import('@eclipse-glsp/server-mcp/lib/common').SerializedElement[]> {
        const buckets = super.prepareElement(element);
        const row = buckets[element.type]?.find(candidate => candidate.id === element.id);
        if (row && element instanceof MetamodelNode && ModelTypes.NAMED_NODE_TYPES.includes(element.type)) {
            const name = this.labelProvider.getLabel(element)?.text;
            if (name) {
                row.name = name;
            }
        } else if (row && element.type === ModelTypes.UN_SDG_TARGET) {
            const label = this.labelProvider.getLabel(element)?.text;
            if (label) {
                row.label = label;
            }
        } else if (row && ModelTypes.METAMODEL_EDGE_TYPES.includes(element.type)) {
            row.relationship = element.type;
            const label = this.labelProvider.getLabel(element)?.text;
            if (label) {
                row.label = label;
            }
        }
        return buckets;
    }
}

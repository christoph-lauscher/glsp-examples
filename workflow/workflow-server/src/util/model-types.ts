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
/* eslint-disable @typescript-eslint/padding-line-between-statements */
export namespace ModelTypes {
    export const ROLE = 'Role';
    export const TASK_ENTITY = 'Task';
    export const CAPABILITY = 'Capability';
    export const HARD_GOAL = 'Hard_Goal';
    export const SOFT_GOAL = 'Soft_Goal';
    export const HARD_SUSTAINABILITY_GOAL = 'Hard_Sustainability_Goal';
    export const SOFT_SUSTAINABILITY_GOAL = 'Soft_Sustainability_Goal';
    export const UN_SDG = 'UNSustainable_Development_Goal';
    export const UN_SDG_TARGET = 'UNSustainable_Development_Goal_Target';
    export const SUSTAINABILITY_CAPABILITY = 'Sustainability_Capability';

    export const METAMODEL_NODE_TYPES = [
        ROLE,
        TASK_ENTITY,
        CAPABILITY,
        HARD_GOAL,
        SOFT_GOAL,
        HARD_SUSTAINABILITY_GOAL,
        SOFT_SUSTAINABILITY_GOAL,
        UN_SDG,
        UN_SDG_TARGET,
        SUSTAINABILITY_CAPABILITY
    ];
    export const NAMED_NODE_TYPES = [
        ROLE,
        TASK_ENTITY,
        CAPABILITY,
        HARD_GOAL,
        SOFT_GOAL,
        HARD_SUSTAINABILITY_GOAL,
        SOFT_SUSTAINABILITY_GOAL
    ];

    export const WANTS_TASK = 'wants_task';
    export const WANTS_CAPABILITY = 'wants_capability';
    export const SO_THAT_TASK = 'so_that_task';
    export const CONTRIBUTES_TO_GOAL = 'contributes_to_goal';
    export const SO_THAT_SOFT_GOAL = 'so_that_soft_goal';
    export const CONTRIBUTES_TO_SOFT_SUSTAINABILITY_GOAL = 'contributes_to_soft_sustainability_goal';
    export const SUPPORTS_TARGET = 'supports_target';
    export const INTEGRATES_DOMAIN_GOAL = 'integrates_domain_goal';
    export const INTEGRATES_CAPABILITY = 'integrates_capability';
    export const CONTAINS_TARGET = 'contains_target';

    export const METAMODEL_EDGE_TYPES = [
        WANTS_TASK,
        WANTS_CAPABILITY,
        SO_THAT_TASK,
        CONTRIBUTES_TO_GOAL,
        SO_THAT_SOFT_GOAL,
        CONTRIBUTES_TO_SOFT_SUSTAINABILITY_GOAL,
        SUPPORTS_TARGET,
        INTEGRATES_DOMAIN_GOAL,
        INTEGRATES_CAPABILITY,
        CONTAINS_TARGET
    ];

    export const LABEL_METAMODEL = 'label:metamodel';
    export const LABEL_METAMODEL_DISPLAY = 'label:metamodel-display';
    export const LABEL_METAMODEL_TYPE = 'label:metamodel-type';
    export const LABEL_SDG_LEVEL = 'label:sdg-level';

    export interface MetamodelEdgeDefinition {
        id: string;
        label: string;
        description: string;
        sourceTypes: string[];
        targetTypes: string[];
    }

    export const METAMODEL_EDGES: MetamodelEdgeDefinition[] = [
        {
            id: WANTS_TASK,
            label: 'Wants Task',
            description: 'Role to Task; predicate may be wants, wants_to, needs, can, or would_like (1..n to 0..n).',
            sourceTypes: [ROLE],
            targetTypes: [TASK_ENTITY]
        },
        {
            id: WANTS_CAPABILITY,
            label: 'Wants Capability',
            description: 'Role to Capability; predicate may be wants, wants_to, needs, can, or would_like (1..n to 0..n).',
            sourceTypes: [ROLE],
            targetTypes: [CAPABILITY]
        },
        {
            id: SO_THAT_TASK,
            label: 'So That Task',
            description: 'Capability to Task (0..n to 0..n).',
            sourceTypes: [CAPABILITY],
            targetTypes: [TASK_ENTITY]
        },
        {
            id: CONTRIBUTES_TO_GOAL,
            label: 'Contributes To Goal',
            description: 'Task or Capability to a hard, soft, or sustainability goal (0..n to 0..n).',
            sourceTypes: [TASK_ENTITY, CAPABILITY],
            targetTypes: [HARD_GOAL, SOFT_GOAL, HARD_SUSTAINABILITY_GOAL, SOFT_SUSTAINABILITY_GOAL]
        },
        {
            id: SO_THAT_SOFT_GOAL,
            label: 'So That Soft Goal',
            description: 'Hard Goal to Soft Goal (0..n to 0..n).',
            sourceTypes: [HARD_GOAL],
            targetTypes: [SOFT_GOAL]
        },
        {
            id: CONTRIBUTES_TO_SOFT_SUSTAINABILITY_GOAL,
            label: 'Contributes To Soft Sustainability Goal',
            description: 'Hard or soft sustainability goal to a soft sustainability goal; reflexive links are allowed (0..n).',
            sourceTypes: [HARD_SUSTAINABILITY_GOAL, SOFT_SUSTAINABILITY_GOAL],
            targetTypes: [SOFT_SUSTAINABILITY_GOAL]
        },
        {
            id: SUPPORTS_TARGET,
            label: 'Supports Target',
            description: 'Hard or soft sustainability goal to a UN Sustainable Development Goal target (0..n).',
            sourceTypes: [HARD_SUSTAINABILITY_GOAL, SOFT_SUSTAINABILITY_GOAL],
            targetTypes: [UN_SDG_TARGET]
        },
        {
            id: INTEGRATES_DOMAIN_GOAL,
            label: 'Integrates Domain Goal',
            description: 'Sustainability Capability to a hard or soft sustainability goal (0..n).',
            sourceTypes: [SUSTAINABILITY_CAPABILITY],
            targetTypes: [HARD_SUSTAINABILITY_GOAL, SOFT_SUSTAINABILITY_GOAL]
        },
        {
            id: INTEGRATES_CAPABILITY,
            label: 'Integrates Capability',
            description: 'Hard or soft sustainability goal to a Sustainability Capability; hard goals require exactly one.',
            sourceTypes: [HARD_SUSTAINABILITY_GOAL, SOFT_SUSTAINABILITY_GOAL],
            targetTypes: [SUSTAINABILITY_CAPABILITY]
        },
        {
            id: CONTAINS_TARGET,
            label: 'Contains Target',
            description: 'UN Sustainable Development Goal aggregates its targets.',
            sourceTypes: [UN_SDG],
            targetTypes: [UN_SDG_TARGET]
        }
    ];

    export const LABEL_HEADING = 'label:heading';
    export const LABEL_TEXT = 'label:text';
    export const COMP_HEADER = 'comp:header';
    export const LABEL_ICON = 'label:icon';
    export const WEIGHTED_EDGE = 'edge:weighted';
    export const ICON = 'icon';
    export const ACTIVITY_NODE = 'activityNode';
    export const DECISION_NODE = `${ACTIVITY_NODE}:decision`;
    export const MERGE_NODE = `${ACTIVITY_NODE}:merge`;
    export const FORK_NODE = `${ACTIVITY_NODE}:fork`;
    export const JOIN_NODE = `${ACTIVITY_NODE}:join`;
    export const TASK = 'task';
    export const MANUAL_TASK = `${TASK}:manual`;
    export const AUTOMATED_TASK = `${TASK}:automated`;
    export const CATEGORY = 'category';
    export const STRUCTURE = 'struct';

    export function toNodeType(type: string): string {
        switch (type) {
            case DECISION_NODE:
                return 'decisionNode';
            case MERGE_NODE:
                return 'mergeNode';
            case FORK_NODE:
                return 'forkNode';
            case JOIN_NODE:
                return 'joinNode';
            case MANUAL_TASK:
                return 'manual';
            case AUTOMATED_TASK:
                return 'automated';
            case CATEGORY:
                return 'category';
            default:
                return 'unknown';
        }
    }
}

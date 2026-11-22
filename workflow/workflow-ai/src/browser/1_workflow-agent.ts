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
/* eslint-disable max-len */
import { AbstractStreamParsingChatAgent, SystemMessageDescription } from '@theia/ai-chat/lib/common';
import { LanguageModelRequirement } from '@theia/ai-core';
import { injectable } from '@theia/core/shared/inversify';
import { WORKFLOW_MCP_TOOL_REFERENCES } from './workflow-mcp-tools';

export const SYSTEM_PROMPT = {
    id: 'workflow-system-prompt1',
    template: `
    You are an assistant helping users creating and modifying "workflow diagrams".
    The graphical workflow diagram language is implemented with Eclipse GLSP.
    You are embedded within the workflow diagram editor.
    
    ## General diagramming
    Diagrams consist of typed nodes and edges. Nodes and edges have a unique identifier,
    a type, a size and a position with x and y values in a two-dimensional canvas.
    The origin of the x and y coordinate system is the top-left corner. The x and y values
    increase going down (y) and going right (x). Nodes have a size. Edges have exactly one source
    and one target node.
    
    ## Workflow diagrams
    The metamodel node types are Role, Task, Capability, Hard_Goal, Soft_Goal,
    Hard_Sustainability_Goal, Soft_Sustainability_Goal, UNSustainable_Development_Goal,
    UNSustainable_Development_Goal_Target, and Sustainability_Capability. Named elements
    use their editable label as name. Role has dimension WHO, Capability has dimension WHAT,
    Task has dimension WHAT or WHY, and goal nodes have dimension WHAT or WHY. A UN SDG target
    has level Strong, Moderate, or Indirect; pass args.level when creating one.

    Use relationship types wants_task, wants_capability, so_that_task, contributes_to_goal,
    so_that_soft_goal, contributes_to_soft_sustainability_goal, supports_target,
    integrates_domain_goal, integrates_capability, and contains_target. Inspect element-types
    for valid source and target types. A Hard_Sustainability_Goal must integrate exactly one
    Sustainability_Capability; UN Sustainable Development Goals contain targets.
    
    ## Instructions for your replies
    Answer brief and don't repeat the state of the diagram.

    ${WORKFLOW_MCP_TOOL_REFERENCES}
`
};

@injectable()
export class WorkflowAgent1 extends AbstractStreamParsingChatAgent {
    constructor() {
        super('Workflow1', [], 'chat');
    }

    override id = 'Workflow1';
    name = 'Workflow1';
    description = 'Simple chat agent for workflow diagrams with just a system prompt.';
    promptTemplates = [SYSTEM_PROMPT];

    override languageModelRequirements: LanguageModelRequirement[] = [
        {
            purpose: 'chat',
            identifier: 'openai/gpt-4o'
        }
    ];

    protected override async getSystemMessageDescription(): Promise<SystemMessageDescription | undefined> {
        const resolvedPrompt = await this.promptService.getPrompt(SYSTEM_PROMPT.id);
        return resolvedPrompt ? resolvedPrompt : undefined;
    }
}

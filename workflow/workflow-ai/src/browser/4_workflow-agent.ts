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
import { AbstractStreamParsingChatAgent, CommandChatResponseContentImpl, SystemMessageDescription } from '@theia/ai-chat/lib/common';
import { ResponseContentMatcher, ResponseContentMatcherProvider } from '@theia/ai-chat/lib/common/response-content-matcher';
import { LanguageModelRequirement } from '@theia/ai-core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { CreateNodes } from './tools';
import { WORKFLOW_MCP_TOOL_REFERENCES } from './workflow-mcp-tools';

export const SYSTEM_PROMPT = {
    id: 'workflow-system-prompt4',
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

    ## Creating elements
    When asked to create or edit diagram elements, use the GLSP MCP tools. Do not output change commands as text.
    Discover element types first, inspect the model to avoid overlaps, and use IDs returned by MCP calls when creating edges.

    ## Instructions for your replies
    Answer brief and don't repeat the state of the diagram.
    Whenever you refer to a specific node, print them as Markdown links, e.g. [<label>](http://workflow/<element-id>).

    ${WORKFLOW_MCP_TOOL_REFERENCES}
`
};

@injectable()
export class CreateCommandMatcherProvider implements ResponseContentMatcherProvider {
    @inject(CreateNodes)
    protected createNodes: CreateNodes;
    readonly matchers: ResponseContentMatcher[] = [
        {
            start: /^<create>$/m,
            end: /^<\/create>$/m,
            contentFactory: (content: string) => {
                const command = content.replace(/^<create>\n|<\/create>$/g, '');
                const createCommand = JSON.parse(command);
                return new CommandChatResponseContentImpl(
                    { id: 'workflow-create-node' },
                    {
                        label: 'Create ' + createCommand.label,
                        callback: async () => {
                            await this.createNodes.createNodes({ nodes: [createCommand] });
                        }
                    },
                    createCommand
                );
            }
        }
    ];
}

@injectable()
export class WorkflowAgent4 extends AbstractStreamParsingChatAgent {
    constructor() {
        super('Workflow4', [], 'chat');
    }

    override id = 'Workflow4';
    name = 'Workflow4';
    description = 'Simple chat agent for workflow diagrams with actionable output.';
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

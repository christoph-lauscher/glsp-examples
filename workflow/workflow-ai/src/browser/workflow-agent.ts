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
import { collectIssueMarkers, GParentElement } from '@eclipse-glsp/client';
import { AbstractStreamParsingChatAgent, SystemMessageDescription } from '@theia/ai-chat/lib/common';
import { LanguageModelRequirement } from '@theia/ai-core';
import { CancellationTokenSource } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { isParent, SModelElementImpl } from 'sprotty';
import { WORKFLOW_SYSTEM_PROMPT } from './system-prompt';
import { WORKFLOW_MCP_TOOL_PREFIX } from './workflow-mcp-tools';

@injectable()
export class WorkflowAgent extends AbstractStreamParsingChatAgent {
    constructor() {
        super('Workflow', [], 'chat');
    }

    override id = 'Workflow';
    name = 'Workflow';
    description = 'This agent supports users in understanding and modifying Workflow diagrams.';
    promptTemplates = [WORKFLOW_SYSTEM_PROMPT];

    override languageModelRequirements: LanguageModelRequirement[] = [
        {
            purpose: 'chat',
            identifier: 'openai/gpt-4o'
        },
        {
            purpose: 'workflow-fix',
            identifier: 'openai/gpt-4o'
        }
    ];

    protected override async getSystemMessageDescription(): Promise<SystemMessageDescription | undefined> {
        const resolvedPrompt = await this.promptService.getPrompt(WORKFLOW_SYSTEM_PROMPT.id);
        return resolvedPrompt ? resolvedPrompt : undefined;
    }

    async fixIssue(element: SModelElementImpl): Promise<void> {
        if (!isParent(element)) {
            return;
        }
        const markers = collectIssueMarkers(element as any as GParentElement);
        const issues = markers
            .flatMap(marker => marker.issues)
            .map(issue => `* ${issue.severity}: ${issue.message}`)
            .join('\n');
        const systemMessage = await this.getSystemMessageDescription();
        if (!systemMessage?.functionDescriptions) {
            throw new Error('Workflow MCP tools are not available');
        }
        const mcpTools = [...systemMessage.functionDescriptions.values()].filter(tool => tool.id.startsWith(WORKFLOW_MCP_TOOL_PREFIX));
        if (mcpTools.length === 0) {
            throw new Error('Workflow MCP tools are not available');
        }
        const prompt =
            `Please fix the following issues for element with id ${element.id}:\n${issues}\n\n` +
            'Use the GLSP MCP tools to inspect the diagram and apply the necessary changes. Do not provide a textual answer.';
        await this.callLlm(
            await this.getLanguageModel('workflow-fix'),
            [
                {
                    actor: 'system',
                    query: systemMessage.text,
                    type: 'text'
                },
                {
                    actor: 'user',
                    query: prompt,
                    type: 'text'
                }
            ],
            mcpTools,
            new CancellationTokenSource().token
        );
    }
}

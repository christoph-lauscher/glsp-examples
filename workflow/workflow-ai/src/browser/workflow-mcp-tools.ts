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

export const WORKFLOW_MCP_TOOL_PREFIX = 'mcp_glsp-workflow_';

const workflowMcpToolNames = [
    'session-info',
    'diagram-model',
    'query-elements',
    'count-elements',
    'element-types',
    'create-nodes',
    'create-edges',
    'delete-elements',
    'modify-nodes',
    'modify-edges',
    'validate-diagram',
    'save-model',
    'undo',
    'redo',
    'get-selection',
    'set-selection',
    'set-view',
    'layout'
];

export const WORKFLOW_MCP_TOOL_REFERENCES = `## GLSP MCP tools
Use these tools to inspect and modify the open workflow diagram. Inspect the current model before editing,
use returned element IDs when creating edges, and validate significant changes.
${workflowMcpToolNames.map(name => `- ~{${WORKFLOW_MCP_TOOL_PREFIX}${name}}`).join('\n')}`;

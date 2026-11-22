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
import { Args, ContextMenuItemProvider, CreateNodeOperation, MenuItem, ModelState, Point } from '@eclipse-glsp/server';
import { inject, injectable } from 'inversify';
import { GridSnapper } from '../handler/grid-snapper';
import { ModelTypes } from '../util/model-types';

@injectable()
export class WorkflowContextMenuItemProvider extends ContextMenuItemProvider {
    @inject(ModelState)
    protected modelState: ModelState;

    getItems(selectedElementIds: string[], position: Point, args?: Args): MenuItem[] {
        if (this.modelState.isReadonly || selectedElementIds.length !== 0) {
            return [];
        }
        const snappedPosition = GridSnapper.snap(position);
        const nodeTypes: MenuItem[] = ModelTypes.METAMODEL_NODE_TYPES.map(type => ({
            id: `new${type}`,
            label: type.replace(/_/g, ' '),
            actions: [CreateNodeOperation.create(type, { location: snappedPosition })]
        }));
        const newChildMenu: MenuItem = {
            id: 'new',
            label: 'New',
            actions: [],
            children: nodeTypes,
            icon: 'add',
            group: '0_new'
        };

        return [newChildMenu];
    }
}

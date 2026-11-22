/********************************************************************************
 * Copyright (c) 2023-2024 EclipseSource and others.
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
import { EdgeCreationChecker, GModelElement } from '@eclipse-glsp/server';
import { injectable } from 'inversify';
import { ModelTypes } from './util/model-types';

@injectable()
export class WorkflowEdgeCreationChecker implements EdgeCreationChecker {
    isValidSource(edgeType: string, sourceElement: GModelElement): boolean {
        const definition = ModelTypes.METAMODEL_EDGES.find(edge => edge.id === edgeType);
        return definition !== undefined && definition.sourceTypes.includes(sourceElement.type);
    }

    isValidTarget(edgeType: string, sourceElement: GModelElement, targetElement: GModelElement): boolean {
        const definition = ModelTypes.METAMODEL_EDGES.find(edge => edge.id === edgeType);
        return (
            definition !== undefined &&
            definition.sourceTypes.includes(sourceElement.type) &&
            definition.targetTypes.includes(targetElement.type)
        );
    }
}

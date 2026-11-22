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
import { Args, GLabel, GLabelBuilder, GNode, GNodeBuilder } from '@eclipse-glsp/server';
import { ModelTypes } from './util/model-types';

export type MetamodelDimension = 'WHO' | 'WHAT' | 'WHY';
export type SustainableDevelopmentLevel = 'Strong' | 'Moderate' | 'Indirect';

export class MetamodelNode extends GNode {
    dimension?: MetamodelDimension;
    level?: SustainableDevelopmentLevel;

    static override builder(): MetamodelNodeBuilder {
        return new MetamodelNodeBuilder(MetamodelNode);
    }
}

export class MetamodelNodeBuilder<T extends MetamodelNode = MetamodelNode> extends GNodeBuilder<T> {
    dimension(dimension: MetamodelDimension): this {
        this.proxy.dimension = dimension;
        return this;
    }

    level(level: SustainableDevelopmentLevel): this {
        this.proxy.level = level;
        return this;
    }

    name(name: string): this {
        return this.addLabel(name, ModelTypes.LABEL_METAMODEL);
    }

    displayLabel(text: string): this {
        const labelType = this.proxy.type === ModelTypes.UN_SDG_TARGET ? ModelTypes.LABEL_SDG_LEVEL : ModelTypes.LABEL_METAMODEL_DISPLAY;
        return this.addLabel(text, labelType);
    }

    typeLabel(text: string): this {
        return this.addLabel(text, ModelTypes.LABEL_METAMODEL_TYPE);
    }

    protected addLabel(text: string, type: string): this {
        this.proxy.children.push(
            new GLabelBuilder(GLabel)
                .id(`${this.proxy.id}_${type.replace(/[^a-zA-Z0-9]/g, '_')}`)
                .type(type)
                .text(text)
                .build()
        );
        return this;
    }

    args(args: Args | undefined): this {
        const dimension = args?.dimension;
        const validDimensions: MetamodelDimension[] =
            this.proxy.type === ModelTypes.ROLE
                ? ['WHO']
                : this.proxy.type === ModelTypes.CAPABILITY
                  ? ['WHAT']
                  : this.proxy.type === ModelTypes.TASK_ENTITY ||
                      this.proxy.type === ModelTypes.HARD_GOAL ||
                      this.proxy.type === ModelTypes.SOFT_GOAL ||
                      this.proxy.type === ModelTypes.HARD_SUSTAINABILITY_GOAL ||
                      this.proxy.type === ModelTypes.SOFT_SUSTAINABILITY_GOAL
                    ? ['WHAT', 'WHY']
                    : [];
        if (args && Object.prototype.hasOwnProperty.call(args, 'dimension')) {
            if (!isMetamodelDimension(dimension) || !validDimensions.includes(dimension)) {
                throw new Error(`Invalid dimension for '${this.proxy.type}': '${String(dimension)}'.`);
            }
            this.dimension(dimension);
        }

        function isMetamodelDimension(value: unknown): value is MetamodelDimension {
            return value === 'WHO' || value === 'WHAT' || value === 'WHY';
        }

        const level = args?.level;
        if (args && Object.prototype.hasOwnProperty.call(args, 'level')) {
            if (
                this.proxy.type !== ModelTypes.UN_SDG_TARGET ||
                (level !== 'Strong' && level !== 'Moderate' && level !== 'Indirect')
            ) {
                throw new Error(`Invalid level for '${this.proxy.type}': '${String(level)}'.`);
            }
            this.level(level);
        }

        return this;
    }
}

import * as $ from 'jquery';
import { Widget } from './widget';

type PropName = 'textSize'|'textColor';

export interface IGridViewNodeProps {
    textSize?: string;
    textColor?: string;
}

export interface IGridViewNode {
    text: string;
    id: string;
    selected?: boolean;
    props?: IGridViewNodeProps;
    propsSelected?: IGridViewNodeProps;
    thumbUrl?: string;
    element?: JQuery;
    [prop:string]: any;
}

export interface IGridViewData {
    itemMinWidth?: string;
    itemMaxWidth?: string;
    itemMinHeight?: string,
    itemMaxHeight?: string;
    borderColor?: string,
    multiSelect?: boolean,
    props?: IGridViewNodeProps;
    propsSelected?: IGridViewNodeProps;
    nodes: IGridViewNode[]
}

export class GridView extends Widget {
    protected static defaults:IGridViewData = {
        itemMinHeight: '128px',
        itemMaxHeight: 'none',
        itemMinWidth: '128px',
        itemMaxWidth: 'none',
        borderColor: '#e1e4e9',
        multiSelect: false,
        props: {
            textSize: 'inherit',
            textColor: 'inherit',
        },
        propsSelected: {
            textSize: 'inherit',
            textColor: 'inherit',
        },
        nodes: []
    };
    private _contentPanel: JQuery|null = null;
    private _selectedNodes: IGridViewNode[] = [];
    private _nodeMap: { [name:string]: IGridViewNode[] } = {};
    getNodes (id: string|RegExp|IGridViewNode): IGridViewNode[] {
        if (typeof id === 'string') {
            return this._nodeMap[id] || [];
        } else if (id instanceof RegExp) {
            const result: IGridViewNode[] = [];
            for (const key in this._nodeMap) {
                if (id.test(key)) {
                    for (const node of this._nodeMap[key]) {
                        result.push (node);
                    }
                }
            }
            return result;
        } else if (id) {
            return [id];
        } else {
            return [];
        }
    }
    toggleSelectNodes (id: string|RegExp|IGridViewNode) {
        const nodes = this.getNodes (id);
        for (const node of nodes) {
            this._selectNode (node, !node.selected);
        }
        if (this._selectedNodes.length > 1) {
            this.options.multiSelect = true;
        }
    }
    selectNodes (id: string|RegExp|IGridViewNode) {
        const nodes = this.getNodes (id);
        for (const node of nodes) {
            if (!node.selected) {
                this._selectNode (node, true);
            }
        }
        if (this._selectedNodes.length > 1) {
            this.options.multiSelect = true;
        }
    }
    deselectNodes (id: string|RegExp|IGridViewNode) {
        const nodes = this.getNodes (id);
        for (const node of nodes) {
            if (node.selected) {
                this._selectNode (node, false);
            }
        }
    }
    setData (data: IGridViewData) {
        this.options = jQuery.extend({}, GridView.defaults, data);
        this._init ();
    }
    protected _init () {
        if (!this._contentPanel) {
            this._contentPanel = $('<div></div>').appendTo(this.$el).addClass(['gridview-container']);
            if (this.options.borderColor) {
                this._contentPanel.css({
                    borderColor: this.options.borderColor
                });
            }
        }
        this._create(this._contentPanel, this.options);
        if (this._selectedNodes.length > 1) {
            this.options.multiSelect = true;
        }
    }
    private _selectNode (node: IGridViewNode, select: boolean) {
        node.selected = select;
        if (node.element) {
            if(select) {
                node.element && node.element.addClass (['active']);
            } else {
                node.element && node.element.removeClass (['active']);
            }
        }
        if (select && this._selectedNodes.indexOf(node) < 0) {
            this._selectedNodes.push (node);
        } else if (!select) {
            const idx = this._selectedNodes.indexOf(node);
            if (idx >= 0) {
                this._selectedNodes.splice (idx, 1);
            }
        }
    }
    private _create (container: JQuery, treeData: IGridViewData): boolean {
        container.empty ();
        const gridContainer = $('<div></div>').appendTo(container).css({
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            width: '100%'
        });
        treeData.nodes.forEach ((node: IGridViewNode, index:number) => {
            const nodelist = this._nodeMap[node.id] || [];
            nodelist.push (node);
            this._nodeMap[node.id] = nodelist;
            const item = node.element = $('<a></a>').appendTo(gridContainer).css({
                display: 'block',
                margin: '15px',
                width: this.options.itemMinWidth
            }).on('click', () => {
                this.$el.trigger ('itemclick', node);
            });
            this._selectNode (node, !!node.selected);
            const body = $('<div></div>').appendTo(item).css({
                position: 'relative',
                display: 'block',
                width: '100%',
                minHeight: this.options.itemMinHeight
            });
            const img = $('<img/>').appendTo(body).css({
                width: this.options.itemMinWidth,
                height: this.options.itemMinHeight
            });
            if (node.thumbUrl) {
                img.attr('src', node.thumbUrl);
            }
            const footer = $('<div></div>').appendTo(item).css({
                width: '100%'
            });
            const desc = $('<p></p>').appendTo(footer).css({
                textAlign: 'center',
                wordBreak: 'normal',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontSize: this.getNodeProp ('textSize'),
                color: this.getNodeProp ('textColor')
            }).html(node.text);
        });
        return true;
    }
    private getProp (name: PropName, props: IGridViewNodeProps|undefined): string|null|undefined {
        return props && props[name];
    }
    private getNodeProp (name: PropName, force?: boolean, node?: IGridViewNode): string {
        let prop:string|null|undefined = node && this.getProp(name, node.selected ? node.propsSelected : node.props);
        if (prop === undefined || (force && prop === null)) {
            prop = this.getProp(name, node && node.selected ? this.options.propsSelected : this.options.props);
        }
        return prop as string;
    }
}
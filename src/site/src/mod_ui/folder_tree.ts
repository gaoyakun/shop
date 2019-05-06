import * as $ from 'jquery';
import { Widget } from './widget';

type PropName = 'textSize'|'textColor'|'icon'|'iconExpand'|'iconSize'|'iconColor'|'iconExpandSize'|'iconExpandColor';

export interface ITreeNodeProps {
    textSize?: string;
    textColor?: string;
    icon?: string|null;
    iconExpand?: string|null;
    iconSize?: string;
    iconColor?: string;
    iconExpandSize?: string;
    iconExpandColor?: string;
}

export interface ITreeNode {
    text: string;
    id: string;
    expanded?: boolean;
    selected?: boolean;
    props?: ITreeNodeProps;
    propsExpanded?: ITreeNodeProps;
    nodes?: ITreeNode[];
    element?: JQuery;
}

export interface ITreeData {
    itemHeight?: string,
    borderColor?: string,
    props?: ITreeNodeProps;
    propsExpanded?: ITreeNodeProps;
    nodes: ITreeNode[]
}

export class FolderTree extends Widget {
    protected static defaults = {
        itemHeight: '43px',
        borderColor: '#e1e4e9',
        multiSelect: false,
        props: {
            textSize: 'inherit',
            textColor: 'inherit',
            icon: 'fa fa-folder',
            iconExpand: 'fa fa-angle-down',
            iconSize: 'inherit',
            iconColor: 'inherit',
            iconExpandSize: 'inherit',
            iconExpandColor: 'inherit'
        },
        propsExpanded: {
            textSize: 'inherit',
            textColor: 'inherit',
            icon: 'fa fa-folder-open',
            iconExpand: 'fa fa-angle-up',
            iconSize: 'inherit',
            iconColor: 'inherit',
            iconExpandSize: 'inherit',
            iconExpandColor: 'inherit'
        },
        nodes: []
    };
    private _contentPanel: JQuery|null = null;
    private _selectedNodes: ITreeNode[] = [];
    private _nodeMap: { [name:string]: ITreeNode[] } = {};
    getNodes (id: string|RegExp|ITreeNode): ITreeNode[] {
        if (typeof id === 'string') {
            return this._nodeMap[id] || [];
        } else if (id instanceof RegExp) {
            const result: ITreeNode[] = [];
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
    toggleSelectNodes (id: string|RegExp|ITreeNode) {
        const nodes = this.getNodes (id);
        for (const node of nodes) {
            this._selectNode (node, !node.selected);
        }
        if (this._selectedNodes.length > 1) {
            this.options.multiSelect = true;
        }
    }
    selectNodes (id: string|RegExp|ITreeNode) {
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
    deselectNodes (id: string|RegExp|ITreeNode) {
        const nodes = this.getNodes (id);
        for (const node of nodes) {
            if (node.selected) {
                this._selectNode (node, false);
            }
        }
    }
    toggleCollapsingNodes (id: string|RegExp|ITreeNode) {
        this._toggleCollapsingNodes (this.getNodes (id));
    }
    collapseNodes (id: string|RegExp|ITreeNode) {
        this._toggleCollapsingNodes (this.getNodes (id).filter ((node, index, array) => !!node.expanded));
    }
    expandNodes (id: string|RegExp|ITreeNode) {
        this._toggleCollapsingNodes (this.getNodes (id).filter ((node, index, array) => !node.expanded));
    }
    protected _init () {
        const that = this;
        this.$el.off('itemclick');
        this.$el.on('itemclick', function(this:JQuery, evt:any, node:ITreeNode) {
            console.log ('internal');
            if (that.options.multiSelect) {
                that.toggleSelectNodes (node);
            } else {
                that.deselectNodes (/^.*$/);
                that.selectNodes (node);
            }
        });
        this._contentPanel = $('<div></div>').appendTo(this.$el).addClass(['folder-tree-container']);
        if (this.options.borderColor) {
            this._contentPanel.css({
                borderColor: this.options.borderColor
            });
        }
        this._create(this._contentPanel, this.options, 0);
        if (this._selectedNodes.length > 1) {
            this.options.multiSelect = true;
        }
    }
    private _selectNode (node: ITreeNode, select: boolean) {
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
    private _toggleCollapsingNodes (nodes: ITreeNode[]) {
        for (const node of nodes) {
            if (!node.element || !node.nodes || node.nodes.length === 0) {
                continue;
            }
            const i = node.element.find('>a>a>i');
            i.removeClass ((this.getNodeProp('iconExpand', true, node) as string).split(' '));
            const fi = node.element.find('>a>span>i');
            let iconClass = this.getNodeProp('icon', true, node);
            if (iconClass) {
                fi.removeClass (iconClass.split(' '));
            }
            node.expanded = !node.expanded;
            i.addClass ((this.getNodeProp('iconExpand', true, node) as string).split(' '));
            iconClass = this.getNodeProp('icon', true, node);
            if (iconClass) {
                fi.addClass (iconClass.split(' '));
            }
            if (node.expanded) {
                node.element.next().removeClass(['collapsed']);
            } else {
                node.element.next().addClass(['collapsed']);
            }
        }
    }
    private _create (container: JQuery, treeData: ITreeData, indent: number): boolean {
        container.empty ();
        const ul = $('<ul></ul>').appendTo(container);
        treeData.nodes.forEach ((node: ITreeNode, index:number) => {
            const nodelist = this._nodeMap[node.id] || [];
            nodelist.push (node);
            this._nodeMap[node.id] = nodelist;
            const indentValue = `${indent}rem`;
            const li = $('<li></li>').appendTo(ul);
            node.element = li;
            this._selectNode (node, !!node.selected);
            const entry = $('<a></a>').appendTo(li);
            entry.css({
                fontSize: this.getNodeProp('textSize', true, node) as string,
                color: this.getNodeProp('textColor', true, node) as string,
                paddingLeft: indentValue
            });
            if (typeof treeData.itemHeight === 'string') {
                entry.css({
                    height: treeData.itemHeight as string,
                    lineHeight: treeData.itemHeight as string
                })
            }
            entry.on('click', () => {
                this.$el.trigger ('itemclick', node)
            });
            const span = $('<span></span>').appendTo(entry);
            const icon = this.getNodeProp ('icon', false, node);
            if (typeof icon === 'string') {
                $('<i></i>').appendTo(span).addClass(icon.split(' ')).css({
                    color: this.getNodeProp('iconColor', true, node) as string,
                    fontSize: this.getNodeProp('iconSize', true, node) as string
                }).after(node.text);
            } else {
                const dummyIcon = this.getNodeProp ('icon', true, node) || 'fa fa-folder';
                $('<i></i>').appendTo(span).addClass(dummyIcon.split(' ')).css({
                    color: 'rgba(0,0,0,0)',
                    fontSize: this.getNodeProp('iconSize', true, node) as string
                }).after(node.text);
            }
            if (node.nodes && node.nodes.length > 0) {
                const btnExpand = $('<a></a>').appendTo(entry);
                btnExpand.attr('href', 'javascript:void(0)');
                const iconExpand = this.getNodeProp ('iconExpand', true, node) as string;
                const i = $('<i></i>').appendTo(btnExpand);
                i.addClass (iconExpand.split(' ')).css({
                    color: this.getNodeProp('iconExpandColor', true, node) as string,
                    fontSize: this.getNodeProp('iconExpandSize', true, node) as string
                });
                btnExpand.on ('click', (e:Event) => {
                    e.cancelBubble = true;
                    e.stopPropagation ();
                    this.toggleCollapsingNodes (node);
                });
                const liSub = $('<li></li>').appendTo(ul);
                this._create (liSub, {
                    itemHeight: treeData.itemHeight,
                    props: treeData.props,
                    propsExpanded: treeData.propsExpanded,
                    nodes: node.nodes
                }, indent+1);
                if (!node.expanded) {
                    liSub.addClass (['collapsed']);
                }
            }
        });
        return true;
    }
    private getProp (name: PropName, props: ITreeNodeProps|undefined): string|null|undefined {
        return props && props[name];
    }
    private getNodeProp (name: PropName, force?: boolean, node?: ITreeNode): string|null|undefined {
        let prop:string|null|undefined = node && this.getProp(name, node.expanded ? node.propsExpanded : node.props);
        if (prop === undefined || (force && prop === null)) {
            prop = this.getProp(name, node && node.expanded ? this.options.propsExpanded : this.options.props);
        }
        return prop;
    }
}
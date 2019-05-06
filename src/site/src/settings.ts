import './ui';
import { ITreeData, ITreeNode } from './ui';
import { Utils } from '../../common/utils';
import { profile_setup } from './mod_settings/profile';


const menuData: ITreeData = {
    props: {
        icon: null,
        iconExpand: 'fa fa-angle-down',
        iconSize: '0px'
    },
    propsExpanded: {
        icon: null,
        iconExpand: 'fa fa-angle-down',
        iconSize: '0px'
    },
    nodes: [{
        text: '基本资料',
        id: 'profile',
    },{
        text: '账号设置',
        id: '_account',
        nodes: [{
            text: '更改密码',
            id: 'reset',
        }, {
            text: '删除账号',
            id: 'delete',
        }]
    },{
        text: '素材管理',
        id: 'assets',
    },{
        text: '白板管理',
        id: 'whiteboards',
    },{
        text: '会话管理',
        id: 'sessions',
    },{
        text: '我的收藏',
        id: 'favorites',
    },{
        text: '退出登录',
        id: 'logout'
    }]
};

function traverseNode_r (root:ITreeNode|ITreeNode[], callback: (this:ITreeNode) => boolean): boolean {
    if (Utils.isArray(root)) {
        for (const node of root) {
            if (traverseNode_r (node, callback)) {
                return true;
            }
        }
    } else {
        const n = root as ITreeNode;
        if (!callback.call (n)) {
            if (n.nodes) {
                return traverseNode_r (n.nodes, callback);
            }
        } else {
            return true;
        }
    }
    return false;
}

const getSettingsMenuData = (id: string):ITreeData => {
    let accountNode:ITreeNode|null = null;
    traverseNode_r (menuData.nodes, function(this:ITreeNode) {
        if (this.id === '_account') {
            accountNode = this;
        }
        this.selected = (this.id === id);
        if (id === 'reset' && accountNode) {
            accountNode.expanded = true;
        }
        return false;
    });
    return menuData;
}

export class Settings {
    constructor (step: string, arg?: any) {
        $("#treeview").folderTree (getSettingsMenuData(step));
        $("#treeview").folderTree ('selectNodes', step);
        $("#treeview").on('itemclick', function(evt, node:ITreeNode){
            if (node.id && node.id.length > 0 && node.id[0] !== '_') {
                window.location.href = `/trust/settings/${node.id}`;
            } else if (node.nodes && node.nodes.length > 0) {
                $(this).folderTree('toggleCollapsingNodes', node);
            }
        });
        switch (step) {
        case 'assets':
            break;
        case 'profile':
            profile_setup (arg);
            break;
        case 'whiteboards':
            break;
        case 'sessions':
            break;
        }
    }
}

export { getSettingsMenuData };

import * as UI from './mod_ui';

export type ITreeData = UI.ITreeData;
export type ITreeNode = UI.ITreeNode;
export type IGridViewData = UI.IGridViewData;
export type IGridViewNode = UI.IGridViewNode;
export type IResourceViewData = UI.IResourceViewData;
export type IToolbarData = UI.IToolbarData;
export type IToolProps = UI.IToolProps;
export type IToolbarCallback = UI.IToolbarCallback;
export type IToolStyles = UI.IToolStyles;
export type IToolGroup = UI.IToolGroup;
export type IChatListData = UI.IChatListData;
export type IChatListUser = UI.IChatListUser;

interface IFolderTree {
    (options?: UI.ITreeData): JQuery;
    (command:'getNodes', id:string|RegExp|UI.ITreeNode): UI.ITreeNode[];
    (command:'toggleSelectNodes'|'selectNodes'|'deselectNodes'|'toggleCollapsingNodes'|'collapseNodes'|'expandNodes', id:string|RegExp|UI.ITreeNode): void;
}

interface IGridView {
    (options?: UI.IGridViewData): JQuery;
    (command:'getNodes', id:string|RegExp|UI.IGridViewNode): UI.IGridViewNode[];
    (command:'toggleSelectNodes'|'selectNodes'|'deselectNodes', id:string|RegExp|UI.IGridViewNode): void;
    (command:'setData', data:UI.IGridViewData): void;
}

interface IResourceView {
    (options?: UI.IResourceViewData): JQuery;
}

interface IToolbar {
    (options?: UI.IToolbarData): JQuery;
    (command:'trigger', id:string, event: string): void;
    (command:'enable', id:string, enabled: boolean): void;
    (command:'setStyle', id:string, styles: IToolStyles): void;
}

interface IChatList {
    (options?: UI.IChatListData): JQuery;
    (command:'getNumUsers'): number;
    (command:'addUser', user:IChatListUser): void;
    (command:'removeUser', id:number): void;
    (command:'clear'): void;
}

declare global {
    interface JQuery {
        folderTree: IFolderTree;
        gridView: IGridView;
        resourceView: IResourceView;
        toolbar: IToolbar;
        chatList: IChatList;
        modal: any;
    }
}

(function () {
    UI.Widget.register (UI.FolderTree, 'folderTree');
    UI.Widget.register (UI.GridView, 'gridView');
    UI.Widget.register (UI.ResourceView, 'resourceView');
    UI.Widget.register (UI.Toolbar, 'toolbar');
    UI.Widget.register (UI.ChatList, 'chatList');
})();


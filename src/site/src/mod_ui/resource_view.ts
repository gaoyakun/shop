import * as $ from 'jquery';
import { Widget } from './widget';
import { GridView, IGridViewData } from './grid_view';
import { uploadFileAjax, ajaxRequest } from '../mod_tools';

export interface IResourceViewData extends IGridViewData {
    path?: string;
}

export class ResourceView extends GridView {
    protected _init () {
        const assetData = this.options as IResourceViewData;
        const relPath = assetData.path || '/';
        ajaxRequest ({
            url: '/api/trust/asset',
            type: 'get',
            data: {
                relPath: relPath
            }
        }).then ((assetList:any) => {
            assetData.nodes = [];
            for (const asset of assetList.data) {
                assetData.nodes.push ({
                    text: asset,
                    id: asset,
                    thumbUrl: `/trust/assets/image?name=${encodeURIComponent(asset)}&relPath=${encodeURIComponent(relPath)}&thumb=1`
                });
            }
            super._init ();
        });
    }
}
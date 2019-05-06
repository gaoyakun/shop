import * as $ from 'jquery';
import './ui';
import { IGridViewData, IGridViewNode } from './ui';
import { ajaxRequest } from './mod_tools';

export function landing_setup () {
    (async function () {
        const roomData: IGridViewData = {
            itemMinWidth: '100px',
            itemMaxWidth: '100px',
            itemMinHeight: '100px',
            nodes: []
        }
        const roomList: any = await ajaxRequest ({
            url: '/api/trust/public_rooms',
            type: 'get'
        });
        for (const room of roomList.data) {
            roomData.nodes.push ({
                text: room.name,
                id: `room-${room.id}`,
                roomId: room.id,
                thumbUrl: '/images/default.jpg'
            });
        }
        $('#room-grid-view').gridView (roomData);
        $('#room-grid-view').on ('itemclick', async function(this:Element, evt, node:IGridViewNode) {
            window.location.href = `/trust/publish_room?room_id=${node.roomId}`;
        });
    })();
}



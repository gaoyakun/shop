import * as $ from 'jquery';
import { Widget } from './widget';

export interface IChatListData {
    name: string;
    maxUsers?: number;
}

export interface IChatListUser {
    id: number;
    name: string;
    icon: string;
}

export class ChatList extends Widget {
    private _numUsers: number = 0;
    private _users: { [id: number]: IChatListUser } = {};
    private _$header: JQuery|null = null;
    private _$users: JQuery|null = null;
    getNumUsers () {
        return this._numUsers;
    }
    addUser (user: IChatListUser) {
        if (this._users[user.id]) {
            console.error (`User ${user.id} is already in room`);
        } else {
            this._users[user.id] = user;
            const li = $('<li></li>').attr('user_id', user.id).appendTo (this._$users!);
            const divUser = $('<div></div>').addClass (['d-flex', 'flex-row', 'align-items-stretch']).css({
                height: '100%'
            }).appendTo (li);
            $('<img/>').addClass ('rounded-circle').attr('src', user.icon).appendTo (divUser);
            const userPane = $('<div></div>').css({
                marginLeft: '15px'
            }).appendTo (divUser);
            $('<span></span>').html (user.name).appendTo (userPane);
            this._numUsers++;
        }
    }
    removeUser (id: number) {
        if (this._users[id]) {
            delete this._users[id];
            this._$users!.find (`li[user_id="${id}"]`).remove ();
            this._numUsers--;
        }
    }
    clear () {
        this._users = {};
        this._numUsers = 0;
        if (this._$users) {
            this._$users.empty ();
        }
        this._$header!.html(`${this.options.name}(${this._numUsers})`)
    }
    protected _init () {
        const card = $('<div></div>').addClass(['card', 'bg-light', 'text-dard']).css('height', '100%').appendTo (this.$el);
        this._$header = $('<div></div>').addClass('card-header').html(`${this.options.name}(${this._numUsers})`).appendTo(card);
        const body = $('<div></div>').addClass(['card-body','chat-list','p-0']).appendTo(card);
        this._$users = $('<ul></ul>').appendTo(body);
        /*
        this.$el.addClass (['p-0', 'd-flex', 'flex-column', 'chat-list']);
        const header = $('<div></div>').css ({
            padding: '10px',
            borderBottom: '1px solid #c4c4c4'
        }).appendTo (this.$el);
        this._$header = $('<p></p>').html(`${this.options.name}(${this._numUsers})`).appendTo(header);
        const body = $('<div></div>').addClass ('flex-grow-1').appendTo(this.$el);
        this._$users = $('<ul></ul>').appendTo(body);
        */
    }
}
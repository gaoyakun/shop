import * as $ from 'jquery';
import { Widget } from './widget';

export interface IToolbarCallback {
    (this:Element, type?:'selected'|'deselected'): void
}

export interface IToolStyles {
    icon?: string;
    text?: string;
    css?: any;
}

export interface ISubToolProps {
    id?: string;
    styles: IToolStyles;
    disabled?: boolean;
    callback?: IToolbarCallback;
}

export interface IToolProps extends ISubToolProps {
    type?: 'button'|'radio'|'check';
    radioGroup?: number;
    active?: boolean;
    subIndex?: number;
    subTools?: ISubToolProps[]; 
}

export interface IToolGroup {
    seperator?: boolean;
    tools: IToolProps[];
}

export interface IToolbarData {
    iconWidth?: number;
    iconHeight?: number;
    menuIconWidth?: number;
    menuIconHeight?: number;
    groups: { [groupName: string]: IToolGroup };
}

export class Toolbar extends Widget {
    private _newClassList: string[];
    constructor(el:Element, options:any) {
        super (el, options);
        this._newClassList = [];
    }
    enable (id: string, enabled: boolean) {
        const that = this;
        that.$el.find('a').each (function () {
            const data = $(this).data ('tool') as ISubToolProps;
            if (data && data.id === id) {
                const subIndex = $(this).attr('sub-index');
                const isSubButton = subIndex !== undefined;
                if (!isSubButton) {
                    const props = data as IToolProps;
                    if (!props.subTools || props.subTools.length === 0) {
                        if (enabled) {
                            $(this).removeClass ('no-pointer-events');
                            $(this).find('>div').removeClass ('no-pointer-events');
                        } else {
                            $(this).addClass ('no-pointer-events');
                            $(this).find('>div').addClass ('no-pointer-events');
                        }
                    }
                } else {
                    if (enabled){
                        $(this).removeClass ('no-pointer-events');
                    } else {
                        $(this).addClass ('no-pointer-events');
                    }
                }
            }
        });
    }
    setStyle (id: string, styles: IToolStyles) {
        const that = this;
        that.$el.find('a').each (function () {
            const data = $(this).data ('tool') as ISubToolProps;
            if (data && data.id === id) {
                const subIndex = $(this).attr('sub-index');
                const isSubButton = subIndex !== undefined;
                that._applyStyle ($(this), styles, isSubButton);
                if (isSubButton) {
                    const btn = $(this.parentElement!).prev();
                    const btnData = btn.data ('tool') as IToolProps;
                    if (btnData.subIndex === Number(subIndex)) {
                        that._applyStyle (btn, { 
                            icon: btnData.styles.icon, 
                            text: btnData.styles.text 
                        }, false);
                    }
                }
            }
        });
    }
    clear () {
        this.$el.empty ();
    }
    trigger (id: string, event: string) {
        this.$el.find('a').each (function () {
            const data = $(this).data('tool');
            if (data && data.id === id) {
                $(this).find('>div').trigger (event);
            }
        });
    }
    protected _applyStyle (button: JQuery, styles: IToolStyles, subButton: boolean) {
        const data = button.data('tool') as ISubToolProps;
        Object.assign (data.styles, styles);
        styles.icon && (subButton ? button.find('>img').attr('src', styles.icon) : button.find('>div>img').attr ('src', styles.icon));
        styles.text && (subButton ? button.find('>small').html (styles.text) : button.find('>div>div').html (styles.text));
        styles.css && button.css (styles.css);
    }
    protected _init () {
        for (const cls of ['p-0', 'toolbar']) {
            if (!this.$el.hasClass (cls)) {
                this.$el.addClass (cls);
                this._newClassList.push (cls);
            }
        }
        for (const groupName in this.options.groups) {
            const options = this.options as IToolbarData;
            const group = options.groups[groupName];
            const groupDiv = $('<div></div>').addClass (['btn-group']).attr('role', 'group').appendTo (this.$el);
            for (let i = 0; i < group.tools.length; i++) {
                this.createToolButton (groupDiv, group, i);
            }
            if (group.seperator) {
                $('<div></div>').addClass ('toolbar-seperator').appendTo (this.$el);
            }
        }
    }
    protected _deinit () {
        this.$el.empty ();
        this.$el.removeClass (this._newClassList);
        this._newClassList = [];
    }
    private createToolButton (groupDiv: JQuery, group: IToolGroup, index: number) {
        const that = this;
        const tool = group.tools[index];
        if (tool.type !== 'radio' && tool.type !== 'check') {
            tool.type = 'button';
        }
        if (!tool.radioGroup) {
            tool.radioGroup = 0;
        }
        tool.active = false;
        if (tool.subTools && tool.subTools.length > 0) {
            tool.subIndex = 0;
            tool.id = tool.subTools[0].id;
            tool.styles.icon = tool.subTools[0].styles.icon;
            tool.styles.text = tool.subTools[0].styles.text;
            tool.callback = tool.subTools[0].callback;
        }
        const button = $('<a></a>').addClass('btn').appendTo(groupDiv);
        button.data ('tool', tool);
        const attrType = 'tb-button-type';
        const attrRadioGroup = 'tb-button-radio-group';
        const attrActive = 'tb-button-active';
        button.attr(attrType, tool.type);
        button.attr(attrRadioGroup, tool.radioGroup);
        tool.styles.css && button.css (tool.styles.css);
        tool.disabled && button.addClass ('no-pointer-events');
        const clickDiv = $('<div></div>').css({
            display: 'inline-block'
        }).appendTo (button);
        tool.disabled && clickDiv.addClass ('no-pointer-events');
        clickDiv.on ('mouseenter', function(){
            $(this.parentElement!).addClass ('selected');
        });
        clickDiv.on ('mouseleave', function(){
            if ($(this.parentElement!).attr(attrType) === 'button' || $(this.parentElement!).attr(attrActive) === undefined) {
                $(this.parentElement!).removeClass ('selected');
            }
        });
        clickDiv.on ('click', function (this: HTMLElement, ev: Event) {
            ev.stopPropagation ();
            const btn = $(this.parentElement!);
            const data: IToolProps = btn.data ('tool');
            const type = btn.attr(attrType);
            if (type !== 'button') {
                if (type === 'radio') {
                    if (btn.attr(attrActive) === undefined) {
                        const groupButtons = btn.siblings(`a[${attrRadioGroup}=${btn.attr(attrRadioGroup)}][${attrActive}]`);
                        groupButtons.removeAttr (attrActive).removeClass('selected').each (function (){
                            const thatData = $(this).data('tool') as ISubToolProps;
                            that.$el.trigger ('itemdeselected', thatData.id);
                            thatData.callback && thatData.callback.call (that.$el[0], 'deselected');
                        });
                        btn.attr(attrActive, '').addClass ('selected');
                        that.$el.trigger ('itemselected', data.id);
                        data.callback && data.callback.call (that.$el[0], 'selected');
                    }
                } else {
                    if (btn.attr(attrActive) === undefined) {
                        btn.attr(attrActive, '').addClass ('selected');
                        that.$el.trigger ('itemselected', data.id);
                        data.callback && data.callback.call (that.$el[0], 'selected');
                    } else {
                        btn.removeAttr(attrActive).removeClass ('selected');
                        that.$el.trigger ('itemdeselected', data.id);
                        data.callback && data.callback.call (that.$el[0], 'deselected');
                    }
                }
            } else {
                that.$el.trigger ('itemclick', data.id);
                data.callback && data.callback.call (that.$el[0])
            }
        });
        tool.styles.icon ? $('<img/>').attr({
            src: tool.subTools && tool.subTools.length > 0 ? tool.subTools[0].styles.icon : tool.styles.icon,
            width: this.options.iconWidth || 28,
            height: this.options.iconHeight || 28
        }).appendTo(clickDiv) : null;
        tool.styles.text ? $('<div></div>').addClass('small').html(tool.styles.text).appendTo (clickDiv) : null;
        if (tool.subTools && tool.subTools.length > 0) {
            button.addClass (['dropdown-toggle', 'no-pointer-events']).attr('data-toggle', 'dropdown');
            const menu = $('<div></div>').addClass ('dropdown-menu').appendTo (groupDiv);
            for (let i = 0; i < tool.subTools.length; i++) {
                const subTool = tool.subTools[i];
                const subToolButton = $('<a></a>').addClass('dropdown-item').attr('sub-index', i).appendTo (menu);
                subToolButton.data ('tool', subTool);
                if (subTool.id) {
                    subToolButton.attr ({ id: subTool.id });
                }
                if (subTool.styles.css) {
                    subToolButton.css (subTool.styles.css);
                }
                subTool.disabled && subToolButton.addClass ('no-pointer-events');
                subToolButton.on ('click', function(this: HTMLElement, ev: Event) {
                    const btn = $(this.parentElement!).prev();
                    const thatData = btn.data('tool') as IToolProps;
                    const thisData = $(this).data('tool') as ISubToolProps;
                    const index = Number($(this).attr('sub-index'));
                    if (thatData.type === 'button') {
                        if (thatData.subIndex !== index) {
                            thatData.subIndex = index;
                            thatData.id = thisData.id;
                            thatData.callback = thisData.callback;
                            that._applyStyle (btn, { 
                                icon: thisData.styles.icon, 
                                text: thisData.styles.text 
                            }, false);
                            //thatData.styles.text && btn.find('>div>div').html (thatData.styles.text);
                            //thatData.styles.icon && btn.find('>div>img').attr ('src', thatData.styles.icon);
                        }
                        if (thatData.callback) {
                            thatData.callback.call (that.$el[0]);
                        }
                        that.$el.trigger('itemclick', thatData.id);
                    } else if (thatData.type === 'check') {
                        const c = btn.find('>div');
                        c.trigger ('click');
                        if (thatData.subIndex !== index) {
                            thatData.subIndex = index;
                            thatData.id = thisData.id;
                            thatData.callback = thisData.callback;
                            that._applyStyle (btn, {
                                icon: thisData.styles.icon,
                                text: thisData.styles.text
                            }, false);
                            c.trigger ('click');
                        }
                    } else {
                        const c = btn.find('>div');
                        if (btn.attr(attrActive) === undefined) {
                            if (thatData.subIndex !== index) {
                                thatData.subIndex = index;
                                thatData.id = thisData.id;
                                thatData.callback = thisData.callback;
                                that._applyStyle (btn, {
                                    icon: thisData.styles.icon,
                                    text: thisData.styles.text
                                }, false);
                            }
                            c.trigger ('click');
                        } else if (thatData.subIndex !== index) {
                            btn.removeAttr (attrActive).removeClass('selected');
                            that.$el.trigger ('itemdeselected', thatData.id);
                            thatData.callback && thatData.callback.call (that.$el[0], 'deselected');
                            thatData.subIndex = index;
                            thatData.id = thisData.id;
                            thatData.callback = thisData.callback;
                            that._applyStyle (btn, {
                                icon: thisData.styles.icon,
                                text: thisData.styles.text
                            }, false);
                            c.trigger ('click');
                        }
                    }
                });
                if (subTool.styles.icon) {
                    $('<img/>').attr({
                        src: subTool.styles.icon,
                        width: this.options.menuIconWidth || 20,
                        height: this.options.menuIconHeight || 20
                    }).appendTo (subToolButton);
                }
                if (subTool.styles.text) {
                    $('<small></small>').addClass('ml-2').html (subTool.styles.text).appendTo(subToolButton);
                }
            }
        }
        return button;
    }
}
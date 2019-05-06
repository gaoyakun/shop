export class Widget {
    [key: string]: any;
    protected static defaults = {};
    options: any;
    protected $el: JQuery<any>;
    constructor(el:Element, options:any) {
        this.$el = jQuery(el);
        const defaults = (this.constructor as typeof Widget).defaults;
        this.options = jQuery.extend({}, defaults, options);
    }
    static register(widgetClass: any, widgetName: string) {
        const getDataKey = () => `widget_${widgetName}`;
        function getWidgetData(el:Element, dataKey:string) {
            const widget = jQuery.data(el, dataKey);
            return widget && widget instanceof Widget ? widget : null;
        }
        function createWidget($el:JQuery, options:object) {
            const dataKey = getDataKey();
            for (const el of $el.get()) {
                const existingWidget = getWidgetData(el, dataKey);
                if (existingWidget) {
                    existingWidget.destroy ();
                }
                const widget = new widgetClass(el, options);
                if (!jQuery.data(el, dataKey)) {
                    jQuery.data(el, dataKey, widget);
                }
                widget._init ();
            }
            return $el;
        }
        function destroyWidget($el:JQuery) {
            const dataKey = getDataKey ();
            for (const el of $el.get()) {
                const widget = getWidgetData(el, dataKey);
                if (widget) {
                    widget.destroy ();
                }
                jQuery.removeData(el, dataKey);
            }
        }
        function callFunction ($el:JQuery, functionName: string, args: any[]): any {
            let result = null;
            for (const el of $el.get()) {
                const widget = jQuery.data(el, getDataKey());
                if (widget && widget instanceof Widget) {
                    const func = widget[functionName];
                    if (func && typeof func === 'function') {
                        result = func.apply (widget, args);
                    }
                }
            }
            return result;
        }
        (jQuery.fn as any)[widgetName] = function (this:JQuery, arg1: any, ...args: any[]) {
            const $el = this;
            if (arg1 === undefined || typeof arg1 === 'object') {
                const options = arg1;
                return createWidget($el, options);
            } else if (typeof arg1 === 'string' && arg1[0] !== '_') {
                const func = arg1;
                if (func === 'destroy') {
                    return destroyWidget ($el);
                } else if (func === 'getWidgetClass') {
                    return widgetClass;
                } else {
                    return callFunction($el, func, args);
                }
            }
        };
    }
    destroy () {
        this._deinit ();
    }
    protected _init() {
        //
    }
    protected _deinit() {
        //
    }  
}
import * as Long from 'long';
import { ErrorCode } from './errcodes';

export class Utils {
    static debug: boolean = false;
    static isNumber (obj: any) {
        return typeof obj === 'number';
    }
    static isInt (obj: any) {
        return this.isNumber(obj) && obj % 1 === 0;
    }
    static isBoolean (obj: any) {
        return typeof obj === 'boolean';
    }
    static isString (obj: any) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
    static isUndefined (obj: any) {
        return Object.prototype.toString.call(obj) === '[object Undefined]';
    }
    static isNull (obj: any) {
        return Object.prototype.toString.call(obj) === '[object Null]';
    }
    static isObject (obj: any) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    static isArray (obj: any) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    static isFunction (obj: any) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }
    static isPrimitive (obj: any) {
        return this.isNumber(obj) || this.isString(obj) || this.isBoolean(obj) || this.isNull(obj) || this.isUndefined(obj);
    }
    static deepCopy (obj: any) {
        return this.isPrimitive(obj) ? obj : JSON.parse(JSON.stringify(obj));
    }
    static equals (obj1: any, obj2: any) {
        for (let propName in obj1) {
            if (obj1.hasOwnProperty(propName) !== obj2.hasOwnProperty(propName)) {
                return false;
            } else if (typeof obj1[propName] !== typeof obj2[propName]) {
                return false;
            }
        }
        for (let propName in obj2) {
            if (obj1.hasOwnProperty(propName) !== obj2.hasOwnProperty(propName)) {
                return false;
            } else if (typeof obj1[propName] !== typeof obj2[propName]) {
                return false;
            }
            if (!obj1.hasOwnProperty(propName)) {
                continue;
            }
            if (obj1[propName] instanceof Array && obj2[propName] instanceof Array) {
                if (!this.equals(obj1[propName], obj2[propName])) {
                    return false;
                } 
            } else if (obj1[propName] instanceof Object && obj2[propName] instanceof Object) {
                if (!this.equals(obj1[propName], obj2[propName])) {
                    return false;
                }
            } else if (obj1[propName] !== obj2[propName]) {
                return false;
            }
        }
        return true;
    }
    static trimLeft (str:string) {
        return str.replace(/(^\s*)/g, '');
    }
    static trimRight (str:string) {
        return str.replace(/(\s*$)/g, '');
    }
    static trim (str:string) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    }
    static mergeBlank = function(str: string) {
        return str.replace(/\s+/g, ' ');
    }
    static toUnicode (str:string): string {
        return str.replace (/[\u007F-\uFFFF]/g, function(chr) {
            return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
        })
    }
    static fromUnicode (str:string): string {
        return str.replace (/\\u[0-9|a-f|A-F]{4}/g, function (s) {
            return String.fromCharCode(parseInt(s.slice(2), 16));
        });
    }
    static safeParseNumber (value: any) {
        return isNaN(value) ? null : parseFloat(value);
    }
    static safeParseInt (value: any, defaultValue?: any) {
        let result =  value!==null && value!==undefined && /^[-+]?\d+$/.test(value.toString()) ? parseInt(value,10) : null;
        if (result == null && this.isNumber(defaultValue)) {
            result = parseInt(defaultValue, 10);
        }
        return result;
    }
    static safeParseLong (value: any) {
        if (isNaN(value)) {
            return null;
        } else if (this.isString(value)) {
            return Long.fromString(value);
        } else if (this.isNumber(value)) {
            return Long.fromNumber(value);
        } else {
            return null;
        }
    }
    static isMD5 (str: any) {
        return this.isString(str) && /^[0-9a-f]{32}$/.test(str);
    }
    static longDivToFixed (value:any, n:number) {
        let lval = value;
        if (this.isNull(lval)||this.isUndefined(lval)) {
            return null;
        } else if (this.isString(lval)) {
            lval = Long.fromString(lval);
        } else if (this.isNumber(lval)) {
            lval = Long.fromNumber(lval);
        }
        let sign = '';
        if (lval.lt(0)) {
            lval = lval.neg();
            sign = '-';
        }
        let divisor = Long.ONE;
        for (let i = 0; i < n; i++) {
            divisor = divisor.mul(10);
        }
        let iPart = lval.div(divisor).toString();
        let fPart = lval.mod(divisor).toString();
        while (fPart.length < n) {
            fPart = '0' + fPart;
        }
        return sign + iPart + '.' + fPart;
    }
    static genDebugStr (str:string, up:number) {
        let skip = 1 + (up||0);
        let f = arguments.callee;
        while (f && skip > 0) {
            f = f.caller;
            skip--;
        }
        let funcName = f ? this.getFunctionName(f)+': ' : '';
        return `${funcName}${str}`;
    }
    static debugOut (str:string, up?:number) {
        if (this.debug) {
            console.log (this.genDebugStr(str, up||0));
        }
    }
    static getFunctionName (callee: Function){
        let _callee = callee.toString().replace(/[\s\?]*/g, '');
        let comb = _callee.length >= 50 ? 50 :_callee.length;
        _callee = _callee.substring(0,comb);
        let name = _callee.match(/^function([^\(]+?)\(/);
        if(name && name[1]){
            return name[1];
        }
        let caller = callee.caller;
        let _caller = caller.toString().replace(/[\s\?]*/g, '');
        let last = _caller.indexOf(_callee);
        let str = _caller.substring(last-30,last);
        name = str.match(/var([^\=]+?)\=/);
        if (name && name[1]) {
            return name[1];
        }
        return 'anonymous';
    }
    static httpResult (err: ErrorCode): any {
        return { 
            err:err,
            message:ErrorCode[err]
        };
    }
}
import { UID } from './uid';
import { Server } from './servermgr';
import { Config } from '../lib/config';

export class Session {
    private _id: string;
    private _data: any;
    constructor (id?: string) {
        this._id = id || UID('sid')
        this._data = {};
    }
    static async loadSession (id: string) {
        const data = await Server.redis.hget (`${Config.redisKeyPrefix}:${Config.redisSessionKey}`, id);
        if (data) {
            const session = new Session (id);
            session._data = JSON.parse(data);
            return session;
        } else {
            return null;
        }
    }
    async save () {
        await Server.redis.hset(`${Config.redisKeyPrefix}:${Config.redisSessionKey}`, this._id, JSON.stringify(this._data));
    };
    async load () {
        try {
            const data = await Server.redis.hget(`${Config.redisKeyPrefix}:${Config.redisSessionKey}`, this._id);
            if (!data) {
                this._data = {};
            } else {
                this._data = JSON.parse (data)
            }
        } catch (e) {
            this._data = null;
        }
    };
    async remove () {
        await Server.redis.hdel (`${Config.redisKeyPrefix}:${Config.redisSessionKey}`, this._id);
    }
    async clear () {
        this._data = {};
        await this.save ();
    }
    get id () {
        return this._id;
    }
    get loginUserId () {
        return this._data.loginUserId;
    }
    set loginUserId (value: number) {
        if (this._data.loginUserId !== value) {
            this._data.loginUserId = value;
            this.save ().catch (reason => {
                throw new Error (reason);
            });
        }
    }
    get loginUserAccount () {
        return this._data.loginUserAccount;
    }
    set loginUserAccount (value: string) {
        if (this._data.loginUserAccount !== value) {
            this._data.loginUserAccount = value;
            this.save ().catch (reason => {
                throw new Error (reason);
            });
        }
    }
    async set (props: object) {
        this._data = Object.assign (this._data, props);
        await this.save ();
    }
}

/*
const Session = function (data) {
    this._data = data || {
        _loginUserId: null,
        _loginUserAccount: null,
        _loginUserRole: null,
        _loginUserStore: null,
        _sessionId: new UID().value,
        _regCode: null,
        _phone: null,
        _sessionToken: null,
        _codeTime:null
    };
    Object.defineProperties(this, {
        data: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data;
            },
            set: newValue=>{
                this._data = newValue;
                this.save ();
            }
        },
        codeTime: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._codeTime;
            },
            set: newValue=>{
                this._data._codeTime = newValue;
                this.save ();
            }
        },
        sessionToken: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._sessionToken;
            },
            set: newValue=>{
                this._data._sessionToken = newValue;
                this.save ();
            }
        },
        phone: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._phone;
            },
            set: newValue=>{
                this._data._phone = newValue;
                this.save ();
            }
        },
        regCode: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._regCode;
            },
            set: newValue=>{
                this._data._regCode = newValue;
                this.save ();
            }
        },
        loginUserId: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._loginUserId;
            },
            set: newValue=>{
                this._data._loginUserId = newValue;
                this.save ();
            }
        },
        loginUserAccount: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._loginUserAccount;
            },
            set: newValue=>{
                this._data._loginUserAccount = newValue;
                this.save ();
            }
        },
        loginUserRole: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._loginUserRole;
            },
            set: newValue=>{
                this._data._loginUserRole = newValue;
                this.save ();
            }
        },
        loginUserStore: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._loginUserStore;
            },
            set: newValue=>{
                this._data._loginUserStore = newValue;
                this.save ();
            }
        },
        sessionId: {
            configurable:false,
            enumerable:false,
            get: ()=>{
                return this._data._sessionId;
            }
        }
    });
};

Session.prototype.clone = function() {
    let other = new Session();
    other._data = utils.deepCopy(this._data);
    return other;
};

Session.prototype.save = function(callback) {
    cache.set(this.sessionId, this._data, callback);
};

Session.prototype.load = function(callback) {
    cache.get(this.sessionId, (err,value)=>{
        if (!err) {
            this._data = value;
        }
        callback && callback(err);
    });
};

module.exports = Session;
*/
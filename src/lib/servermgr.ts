import { Config } from './config';
import { Utils } from '../common/utils';
import * as readline from 'readline';
import * as constants from './constants';
import * as Redis from 'ioredis';

export class Server {
    private static readonly _expireTime = 5;
    private static readonly _ackInterval = 3;
    private static _type: constants.ServerType;
    private static _rank: number;
    private static _id: string;
    private static _postTimer: NodeJS.Timer|null;
    private static _redis: Redis.Redis;
    static get redis () {
        return this._redis;
    }
    static async pickServer (type: constants.ServerType) {
        const rankKey = this._makeRankKey (type);
        while (true) {
            const serverId: string[] = await this._redis.zrange (rankKey, 0, 0);
            if (serverId && serverId.length === 1) {
                const info = await this._redis.hmget (serverId[0], 'host', 'port');
                if (info && info[0] !== null && info[1] !== null) {
                    return { host: info[0], port: info[1], id: parseInt(serverId[0].split(':')[2],10) };
                } else {
                    await this._redis.zrem (rankKey, serverId);
                    continue;
                }
            } else {
                break;
            }
        }
        return null;
    }
    static async getServerInfo (type: constants.ServerType, serverId: number) {
        const id = this._makeId(type, serverId);
        const info = await this._redis.hmget (id, 'host', 'port');
        if (info && info[0] !== null && info[1] !== null) {
            return { host: info[0], port: info[1], id: serverId };
        } else {
            return null;
        }
    }
    static init (type: constants.ServerType) {
        this._type = type;
        this._rank = 0;
        this._postTimer = null;
        this._id = this._makeId(type, Config.serverId);
        this._redis = Config.redis;
        this._postTimer = setInterval (() => {
            this._post ();
        }, this._ackInterval * 1000);
    }
    static startCli (callback: (cmd:string, args:string[]) => void) {
        const rl = readline.createInterface ({
            input: process.stdin,
            output: process.stdout,
            prompt: '>'
        });
        rl.prompt();
        rl.on ('line', line => {
            if (Utils.isString (line)) {
                const cmdline: string[] = (line as string).trim().split(/\s+/);
                const command = cmdline.shift ();
                if (command === 'exit' || command === 'quit') {
                    process.exit (0);
                } else {
                    command && callback && callback (command, cmdline);
                }
            }
            rl.prompt();
        }).on ('close', ()=>{
            process.exit (0);
        });
    }
    static async shutdown () {
        if (this._postTimer) {
            clearTimeout (this._postTimer);
            this._postTimer = null;
        }
        await this._redis.multi().del (this._id).zrem (this._makeRankKey(this._type), this._id).exec();
    }
    private static _post () {
        (async () => {
            await this._redis.multi().hmset(this._id, {
                host: Config.serverHost,
                port: Config.serverPort,
                rank: this._rank
            }).expire(this._id, this._expireTime).zadd (this._makeRankKey(this._type), String(this._rank||0), this._id).exec ();
        })().catch (err => {
            console.log (`ERR: [ServerInfo._post]: ${err}`);
            process.exit (-1);
        });
    }
    private static _makeId (type:constants.ServerType, id:number) {
        return `${Config.redisKeyPrefix}:svr:${type as number}:${id}`;
    }
    private static _makeRankKey (type:constants.ServerType) {
        return `${Config.redisKeyPrefix}:server_rank:${type as number}`;
    }
}
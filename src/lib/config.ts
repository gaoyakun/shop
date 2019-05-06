import { Engine } from './engine';
import { Utils } from '../common/utils';
import * as Redis from 'ioredis';

let cmdlineParams: { [name:string]: string }|null = null;

export interface ITurnServer {
    urls: string[];
    username?: string;
    credential?: string;
}

function getCommandLineParams (): { [name:string]: string } {
    const [node, path, ...argv] = process.argv;
    let result: { [name:string]: string } = {};
    let key: string = '';
    let val: string = '';
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith ('--')) {
            if (key !== '') {
                result[key] = val;
            }
            key = argv[i].slice (2);
            val = '';
        } else if (val !== '') {
            throw new Error (`Invalid command line parameter ${val}`);
        } else {
            val = argv[i];
        }
    }
    if (key !== '') {
        result[key] = val;
    }
    return result;
}

function getParam (name: string, defaultValue:string|Function): string {
    if (!cmdlineParams) {
        cmdlineParams = getCommandLineParams ();
    }
    return cmdlineParams[name]||process.env[`OT_${name.toUpperCase()}`]||(Utils.isString(defaultValue) ? defaultValue : (defaultValue as Function)(name));
}

function getTurnServers (): ITurnServer[] {
    const paramTurnServers = getParam ('turn_servers', '[]');
    try {
        return JSON.parse (paramTurnServers);
    } catch (err) {
        console.log ('Parse turn server error', paramTurnServers);
        return [];
    }
}

function dieForParam (param: string): string {
    throw new Error (`Parameter required: ${param}`);
}

function useSSL (): boolean {
    return getParam ('ssl', 'off') === 'on';
}

export class Config {
    static readonly redisKeyPrefix = getParam ('redis_key_prefix', 'ts');
    static readonly sessionToken = getParam ('session_token', 'ts_session_id');
    static readonly redisSessionKey = getParam ('redis_session_key', 'session_list');
    static readonly serverId = Number(getParam ('server_id', dieForParam));
    static readonly useSSL = useSSL();
    static readonly sslCertFile = useSSL() ? getParam('ssl_cert', dieForParam) : '';
    static readonly sslKeyFile = useSSL() ? getParam('ssl_key', dieForParam) : '';
    static readonly serverHost = `${useSSL()?'https://':'http://'}${getParam('server_host', 'localhost')}`;
    static readonly serverPort = getParam('server_port', dieForParam);
    static readonly redisHost = getParam ('redis_host', 'localhost');
    static readonly redisPort = Number(getParam ('redis_port', '6379'));
    static readonly storageType = getParam ('storage_type', 'local');
    static readonly storageHost = getParam ('storage_host', 'localhost');
    static readonly storagePort = Number(getParam ('storage_port', '8000'));
    static readonly databaseHost = getParam ('database_host', 'localhost');
    static readonly databasePort = Number(getParam ('database_port', '3306'));
    static readonly databaseUser = getParam ('database_user', 'root');
    static readonly databasePassword = getParam ('database_pass', dieForParam);
    static readonly databaseName = getParam ('database_name', 'db_shop');
    static readonly rtcAnnouncedIPv4 = getParam ('rtc_announced_ipv4', '');
    static readonly rtcAnnouncedIPv6 = getParam ('rtc_announced_ipv6', '');
    static readonly turnServers = getTurnServers ();
    private static _engine: Engine|null = null;
    private static _redis: Redis.Redis|null = null;
    static get redis (): Redis.Redis {
        if (!this._redis) {
            this._redis = new Redis (this.redisPort, this.redisHost);
        }
        if (!this._redis) {
            throw new Error ('Redis not initialized');
        }
        return this._redis;
    }
    static get engine (): Engine {
        if (!this._engine) {
            const opt = {
                host: this.databaseHost,
                port: this.databasePort,
                user: this.databaseUser,
                password: this.databasePassword,
                database: this.databaseName
            };
            this._engine = new Engine (opt);
        }
        return this._engine;
    }
}

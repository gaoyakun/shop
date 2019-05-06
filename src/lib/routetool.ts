import { filterXSS as xss } from 'xss';
import * as path from 'path';
import * as express from 'express';
import { Utils } from '../common/utils';
import { ErrorCode } from '../common/errcodes';

interface IHttpParamDefine {
    type?: string;
    source?: 'query'|'body'|'params'|'header'|'cookie'|'auto';
    noXss?: boolean;
    default?: any;
    enum?: any[];
}

interface IApiInterface {
    method?: 'get'|'post'|'put'|'delete'|'options'|'head'|'patch';
    path: string;
    queryParams?: { [name:string]: IHttpParamDefine };
    bodyParams?: { [name:string]: IHttpParamDefine };
    urlParams?: { [name:string]: IHttpParamDefine };
    headerParams?: { [name:string]: IHttpParamDefine };
    cookieParams?: { [name:string]: IHttpParamDefine };
}

interface IApiConfig {
    routes: {
        [name:string]: {
            path: string,
            interfaces: { [name:string]: IApiInterface }
        }
    }
}

export class RouteTool {
    static async loadRouters (app: express.Express, directory: string, json: string) {
        const apiConfig = require(json) as IApiConfig;
        const modules:any = {};
        const promises:Promise<any>[] = [];
        for (const routeName in apiConfig.routes) {
            promises.push (import (path.join(directory, routeName)).then ((m:any)=>{ modules[routeName] = m; }));
        }
        await Promise.all (promises)
        const router = express.Router();
        app.use ('/', router);
        for (const routeName in apiConfig.routes) {
            console.log (`Setting up route for ${routeName}`);
            const routePath = apiConfig.routes[routeName].path;
            const interfaces = apiConfig.routes[routeName].interfaces;
            for (const interfaceName in interfaces) {
                console.log (`route interface ${interfaceName}`);
                const f = modules[routeName][interfaceName];
                if (!f) {
                    const msg = `Handler not found for <${routeName}/${interfaceName}>`;
                    console.log (msg);
                    throw new Error(`Handler not found for <${routeName}/${interfaceName}>`);
                }
                const i = interfaces[interfaceName];
                const method = i.method||'get';
                const interfacePath = i.path;
                const p = path.join(routePath,interfacePath).replace (/\\/g, '/');
                console.log (`Route: ${interfaceName} --> ${p}`)
                router.route(p)[method](async (req, res, next)=>{
                    const t = [[i.queryParams, req.query||{}], [i.bodyParams, req.body||{}], [i.urlParams, req.params||{}], [i.headerParams, req.headers||{}], [i.cookieParams, req.cookies||{}]];
                    const paramResults: { [name:string]:any } = {};
                    for (const params of t) {
                        if (params[0]) {
                            if (!this._httpCheckParams (params[1], params[0], paramResults)) {
                                if (req.xhr) {
                                    return res.json (Utils.httpResult(ErrorCode.kParamError));
                                } else {
                                    const session = req.session;
                                    return res.render ('error', {
                                        user: session && session.loginUserId ? { name: session.loginUserAccount } : undefined,
                                        error: {
                                            code: 400,
                                            message: '请求参数错误。'
                                        }
                                    });
                                }
                            }
                        }
                    }
                    const r = f (req, res, next, paramResults);
                    return (r instanceof Promise) ? r : Promise.resolve(r);
                });
            }
        }
    }
    private static _httpCheckParams (container:any, params: { [name:string]: IHttpParamDefine }, results?: { [name:string]: any }): boolean {
        for (const name in params) {
            const param = container[name];
            const def = params[name];
            let val: any;
            if (!param) {
                if (def.default === undefined) {
                    return false;
                } else {
                    val = def.default;
                }
            } else if (param) {
                const type = def.type || 'string';
                if (type === 'string') {
                    if (!def.noXss && xss(param) !== param) {
                        return false;
                    }
                    val = param;
                } else if (type === 'int') {
                    val = Utils.safeParseInt(param);
                    if (val === null) {
                        return false;
                    }
                } else if (type === 'float') {
                    val = Utils.safeParseNumber(param);
                    if (val === null) {
                        return false;
                    }
                } else if (type === 'long') {
                    val = Utils.safeParseLong (param);
                    if (val === null) {
                        return false;
                    }
                } else {
                    val = param;
                }
                if (def.enum) {
                    let match = false;
                    const isLongType = type === 'long';
                    def.enum.forEach (v => {
                        if (isLongType ? val.eq(v) : val===v) {
                            match = true;
                        }
                    });
                    if (!match) {
                        return false;
                    }
                }
            }
            results && (results[name] = val);
        }
        return true;
    }
}



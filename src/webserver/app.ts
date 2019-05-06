import * as express from 'express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as middlewares from '../lib/middlewares';
import { Server } from '../lib/servermgr';
import { ServerType } from '../lib/constants';
import { Utils } from '../common/utils';
import { ErrorCode } from '../common/errcodes';
import { RouteTool } from '../lib/routetool';

import 'express-async-errors';

const app = express ();

async function initializeApp () {
    Server.init (ServerType.Web);

    app.set ('views', path.join(__dirname, 'views'));
    app.set ('view engine', 'ejs');
    app.set ('view cache', false);
    app.set ('etag', false);

    app.use (logger('dev'));
    app.use (express.urlencoded({ extended: false }));
    app.use (express.json());
    app.use (cookieParser());
    app.use (express.static(path.join(__dirname, '../../site')));
    app.use (middlewares.middlewareSession);

    app.use ((req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.set ('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        next ();
    });
    
    app.use ('/trust', middlewares.middlewareAuth);
    app.use ('/api/trust', middlewares.middlewareAuth);

    await RouteTool.loadRouters (app, path.join(__dirname, 'modules', 'routers'), path.join(__dirname, 'conf', 'api.json'));

    app.use ((req: express.Request, res: express.Response, next: express.NextFunction) => {
        const session = req.session;
        res.render ('error', {
            user: session && session.loginUserId ? { name: session.loginUserAccount } : undefined,
            error: {
                code: 404,
                message: '对不起，您访问的页面不存在。'
            }
        });
    });

    app.use ((err:any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error (err.stack);
        if (req.xhr) {
            res.status(500).json (Utils.httpResult(ErrorCode.kServerError));
        } else {
            const session = req.session;
            res.render ('error', {
                user: session && session.loginUserId ? { name: session.loginUserAccount } : undefined,
                error: {
                    code: err.code ? Number(err.code) : 500,
                    message: String(err.message) || '对不起，服务器错误，请联系客服。'
                }
            });
        }
    });
}

export { app, initializeApp };


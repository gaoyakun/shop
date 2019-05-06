import { ErrorCode } from '../common/errcodes';
import { Utils } from '../common/utils';
import { Session } from './session';
import { Config } from './config';

declare global {
    namespace Express {
        interface Request {
            session?: Session;
        }
    }
}

import * as express from 'express';

export const middlewareSession = async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.session) {
        return next();
    }
    const sessionId = req.cookies[Config.sessionToken];
    if (sessionId) {
        req.session = await Session.loadSession(sessionId) || undefined;
    }
    if (!req.session) {
        req.session = new Session ();
        await req.session.save ();
        res.cookie(Config.sessionToken, req.session.id, {
            expires: new Date(Date.now() + 1000*3600*24*7)
        });
    }
    return next();
};

export const middlewareAuth = function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const session = req.session;
    if (!session || !session.loginUserId) {
        if (req.xhr) {
            // ajax request
            return res.json ({
                err: Utils.httpResult(ErrorCode.kAuthError)
            });
        } else {
            return res.redirect ('/login');
        }
    }
    return next();
}

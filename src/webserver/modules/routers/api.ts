import { Config } from '../../../lib/config';
import { Utils} from '../../../common/utils';
import { ErrorCode } from '../../../common/errcodes';
import { Session } from '../../../lib/session';
import * as express from 'express';
import 'express-async-errors';

export function auth (req:express.Request, res:express.Response) {
    let session = req.session as Session;
    if (session.loginUserId) {
        res.json(Utils.httpResult(ErrorCode.kSuccess));
    } else {
        res.json(Utils.httpResult(ErrorCode.kAuthError));
    }
}

export async function login (req:express.Request, res:express.Response, next:express.NextFunction, params:any) {
    let session: Session = req.session as Session;
    if (!session.loginUserId) {
        const rows = await Config.engine.objects('user').filter([['account', params.account], ['passwd', params.md5password]]).fields(['id','account','name']).all();
        if (rows.length === 1) {
            session.set ({
                loginUserAccount: params.account,
                loginUserId: rows[0].id
            });
            let remember = Utils.safeParseInt(req.body.remember);
            res.cookie(Config.sessionToken, session.id, {
                expires: remember ? new Date(Date.now() + 1000*3600*24*7) : undefined
            });
            return res.json (Utils.httpResult(ErrorCode.kSuccess));
        } else {
            return res.json (Utils.httpResult(ErrorCode.kAuthError));
        }
    } else {
        return res.json (Utils.httpResult(ErrorCode.kSuccess));
    }
}

export async function register (req:express.Request, res:express.Response, next:express.NextFunction, params:any) {
    let session: Session = req.session as Session;
    if (session.loginUserId) {
        return res.json (Utils.httpResult(ErrorCode.kInvalidOperation));
    }
    const dbSession = await Config.engine.beginSession ();
    try {
        const res1 = await dbSession.query({
            sql:'insert into user (account, email, passwd, name) select ?, ?, ?, ? from dual where not exists (select id from user where account=? or email=?)',
            param:[params.account, params.email, params.md5password, params.account, params.account, params.email]
        });
        if (res1.affectedRows === 0) {
            await dbSession.cancel ();
            return res.json (Utils.httpResult(ErrorCode.kAuthError));
        }
        const res2 = await dbSession.query({
            sql: 'insert into `user_profile` (user_id, gender, mobile, avatar) values (?, ?, ?, ?)',
            param: [ res1.insertId, 0, '', '' ]
        });
        if (res2.affectedRows === 0) {
            await dbSession.cancel ();
            return res.json (Utils.httpResult(ErrorCode.kAuthError));
        }
        await dbSession.end ();
        return res.json (Utils.httpResult(ErrorCode.kSuccess));
    } catch (err) {
        await dbSession.cancel ();
        return res.json (Utils.httpResult(ErrorCode.kAuthError));
    }
}

export async function updateProfile (req:express.Request, res:express.Response, next:express.NextFunction, params: any) {
    let session: Session = req.session as Session;
    const result = await Config.engine.query ({
        sql: 'update user u, user_profile p set u.name=?, u.email=?, p.mobile=?, p.gender=? where u.id=? and p.user_id=u.id',
        param: [params.name, params.email, params.mobile, params.gender, session.loginUserId]
    });
    if (result.affectedRows === 0) {
        return res.json (Utils.httpResult(ErrorCode.kServerError));
    }
    return res.json (Utils.httpResult(ErrorCode.kSuccess));
}


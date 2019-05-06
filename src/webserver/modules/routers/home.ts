import { Session } from '../../../lib/session';
import { Config } from '../../../lib/config';
import * as express from 'express';
import 'express-async-errors';

export function homePage(req:express.Request, res:express.Response) {
    const session:Session = req.session as Session;
    const data: any = {};
    if (session.loginUserId) {
        data.user = {
            name: session.loginUserAccount
        }
        res.render ('index', data);
    } else {
        res.render ('login');
    }
}

export function loginPage (req:express.Request, res:express.Response) {
    res.render ('login');
}

export function registerPage (req:express.Request, res:express.Response) {
    res.render ('register');
}

export async function profileSettingPage (req:express.Request, res:express.Response) {
    const session = req.session as Session;
    const user:any = await Config.engine.query ({
        sql:'select u.name as name, u.email as email, p.gender as gender, p.mobile as mobile, p.avatar as avatar from user u inner join user_profile p on u.id=p.user_id where u.id=?',
        param: [session.loginUserId]
    });
    if (!user || user.length !== 1) {
        throw new Error ('未找到该用户');
    }
    res.render ('settings/userprofile', {
        user: {
            id: session.loginUserId,
            name: user[0].name,
            email: user[0].email,
            gender: user[0].gender,
            mobile: user[0].mobile,
            avatar: user[0].avatar
        }
    });
}

export function resetPassSettingPage (req:express.Request, res:express.Response) {
    res.render ('settings/resetpass', {
        user: {
            name: (req.session as Session).loginUserAccount
        }
    });
}


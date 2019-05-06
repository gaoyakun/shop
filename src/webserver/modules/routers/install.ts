import { ErrorCode } from '../../../common/errcodes';
import { Config } from '../../../lib/config';
import { Engine } from '../../../lib/engine';
import * as express from 'express';

export function home (req:express.Request, res:express.Response, next:express.NextFunction) {
    res.redirect ('/install/database');
}

export function database (req:express.Request, res:express.Response, next:express.NextFunction) {
    const host = Config.databaseHost || '';
    const port = Config.databasePort ? String(Config.databasePort) : '';
    const user = Config.databaseUser || '';
    const password = Config.databasePassword || '';
    const name = Config.databaseName || '';
    console.log (`Database settings: ${user}:${password}@${host}:${port}`);
    res.render ('install_db', { db: {
        host: host,
        port: port,
        user: user,
        password: password,
        name: name
    }});
}

export async function setup_database (req:express.Request, res:express.Response, next:express.NextFunction, params:any) {
    const opt = {
        host: params.host,
        port: params.port,
        user: params.username,
        name: params.name,
        password: params.password,
    };
    console.log (opt);
    const engine = new Engine (opt);
    const session: Engine.Session = await engine.beginSession ();
    try {
        const sqlDropDb = `drop database if exists \`${opt.name}\``;
        await session.query (sqlDropDb);
        const sqlCreateDb = `create database \`${opt.name}\` default charset utf8mb4 collate utf8mb4_general_ci`;
        await session.query (sqlCreateDb);
        const sqlUseDb = `use \`${opt.name}\``;
        await session.query (sqlUseDb);
        // create user table
        await session.query (`create table \`user\` (
            \`id\` int unsigned not null primary key auto_increment,
            \`openid\` varchar(64) not null default '',
            \`account\` varchar(32) not null,
            \`passwd\` varchar(32) not null,
            \`name\` varchar(128) not null default '',
            \`gender\` tinyint not null default 0,
            \`province\` varchar(32) not null default '',
            \`city\` varchar(32) not null default '',
            \`country\` varchar(32) not null default '',
            \`state\` tinyint not null default 0,
            \`role\` tinyint not null default 0,
            \`referer\` int not null default 0,
            \`countrycode\` tinyint not null default 86,
            \`phone_num\` varchar(16) not null default '',
            \`avatar_url\` varchar(128) not null default '',
            \`real_name\` varchar(32) not null default '',
            \`email\` varchar(128) not null default '',
            \`invite_url\` int unsigned not null default 0,
            \`creation_time\` int unsigned not null default 0
        ) engine=InnoDB default charset=utf8mb4`);
        // create shop item category table
        await session.query (`create table \`category\` (
            \`id\` int unsigned not null primary key auto_increment,
            \`name\` varchar(32) not null default ''
        ) engine=InnoDB default charset=utf8mb4`);
        // create shop item table
        await session.query (`create table \`shopitem\` (
            \`id\` int unsigned not null primary key auto_increment,
            \`category\` int unsigned not null,
            \`name\` varchar(32) not null,
            \`unit\` varchar(16) not null,
            \`brand\` varchar(32) not null
        ) engine=InnoDB default charset=utf8mb4`);
        // create 
        // finish
        await session.end ();
        res.redirect ('/install/account');
    } catch (err) {
        await session.cancel ();
        throw (err);
    }
}

export function account (req:express.Request, res:express.Response, next:express.NextFunction) {
    res.render ('install_account', {
        admin: {
            user: '',
            email: ''
        }
    });
}

export async function setup_account (req:express.Request, res:express.Response, next:express.NextFunction, params:any) {
    const engine = Config.engine;
    const session = await engine.beginSession ();
    try {
        await session.query ({
            sql: 'insert into `user` (account, passwd, email) values (?, ?, ?)',
            param: [ params.account, params.md5password, params.email ]
        });
        await session.end ();
        res.redirect ('/');
    } catch (err) {
        await session.cancel ();
        console.error (err);
        res.json ({
            err: ErrorCode.kDatabaseError
        });
    }
}

import * as request from 'request';

export async function requestWrapper (url:string, method:'GET'|'POST', json?:object) {
    return new Promise<string>((resolve, reject) => {
        const options:any = {
            url: url,
            method: method,
            callback: (err:any, response:any, body:any) => {
                if (!err && response.statusCode === 200) {
                    resolve (body);
                } else {
                    reject (err);
                }
            }
        };
        if (json) {
            options.json = json;
        }
        request (options);
    });
}

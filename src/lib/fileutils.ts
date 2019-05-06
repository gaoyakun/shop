import * as fs from 'fs';
import * as path from 'path';

export async function fileExists (filename: string) {
    return new Promise ((resolve, reject) => {
        fs.exists (filename, (exists: boolean) => {
            resolve (exists);
        });
    });
}
export async function fileStat (filename: string) {
    return new Promise<fs.Stats> ((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
            if (err) {
                reject (err);
            } else {
                resolve (stats);
            }
        });
    });
}
export async function readDir (dir: string) {
    return new Promise<string[]> ((resolve, reject) => {
        fs.readdir (dir, (err, files) => {
            if (err) {
                reject (err);
            } else {
                resolve (files);
            }
        });
    });
}
export async function mkDir (dir: string) {
    return new Promise ((resolve, reject) => {
        fs.mkdir (dir, err => {
            if (err) {
                reject (err);
            } else {
                resolve ();
            }
        });
    });
}
export async function writeFile (filename: string, content: Buffer|string) {
    return new Promise((resolve, reject) => {
        fs.writeFile (filename, content, err => {
            if (err) {
                reject (err);
            } else {
                resolve ();
            }
        });
    });
}
export async function readFile (filename: string) {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile (filename, (err, data) => {
            if (err) {
                reject (err);
            } else {
                resolve (data);
            }
        });
    });
}
export async function mkdirs (dirpath: string) {
    if (!(await fileExists(dirpath))) {
        let pathtmp = '';
        for (const dirname of dirpath.split(/[/\\]/)) {
            pathtmp = pathtmp ? path.join(pathtmp, dirname) : dirname;
            if (pathtmp === '') {
                pathtmp = '/';
            }
            if (!(await fileExists(pathtmp))) {
                await mkDir (pathtmp)
            } else if (!(await fileStat(pathtmp)).isDirectory()) {
                throw new Error(`[mkdirs] path already exists but is not a directory <${dirpath}>`);
            }
        }
    } else if (!(await fileStat(dirpath)).isDirectory()) {
        throw new Error(`[mkdirs] path already exists but is not a directory <${dirpath}>`);
    }
}
export async function loadFileList (dir: string) {
    const result: string[] = [];
    if (await fileExists(dir) && (await fileStat(dir)).isDirectory()) {
        for (const file of await readDir (dir)) {
            if (file[0] !== '.') {
                let curPath = path.join(dir, file);
                if((await fileStat(curPath)).isDirectory()) {
                    result.push (file + '/');
                } else {
                    result.push (file);
                }
            }
        }
    }
    return result;
}

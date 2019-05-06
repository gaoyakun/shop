const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const postcss = require('rollup-plugin-postcss');
const simplevars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const path = require('path');
const fs = require('fs');

const jsFiles = [
    'landing',
    'install',
    'login',
    'ui',
    'settings'
];

const rootDir = path.join(__dirname, '..');
const staticDir = path.join(rootDir, 'src/site/static');
const siteDir = path.join(rootDir, 'dist/site');
const compiledDir = path.join(siteDir, 'compiled')

async function build(inputOptions, outputOptions) {
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
}

copyFolderRecursive (staticDir, siteDir);

const promises = jsFiles.map (name => {
    return build ({
        input: path.join(compiledDir, 'site', 'src', name+'.js'),
        plugins: [postcss({
            plugins: [
                simplevars(),
                nested(),
                cssnext({ warnForDuplicates: false}),
                cssnano()
            ],
            extensions: [ '.css', '.scss' ]
        }), commonjs(), resolve({
            moduleDirectory: path.join(rootDir, 'node_modules')
        })/*, uglify.uglify()*/],
        external: ['jquery', 'socket.io-client']
    }, {
        file: path.join(siteDir, 'js', name+'.js'),
        name: name,
        exports: 'named',
        format: 'umd',
        globals: { jquery:'jQuery', 'socket.io-client':'io' }
    });
});

function copyFile (srcFile, destFile) {
    const data = fs.readFileSync (srcFile, 'binary');
    fs.writeFileSync (destFile, data, 'binary');
}

function deleteFolderRecursive(dirpath) {
    if( fs.existsSync(dirpath) ) {
        fs.readdirSync(dirpath).forEach(function(file) {
            var curPath = path.join(dirpath, file);
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirpath);
    }
}

function mkdirsSync(dirpath) { 
    if (!fs.existsSync(dirpath)) {
        let pathtmp;
        dirpath.split(/[/\\]/).forEach(function (dirname) {
            pathtmp = pathtmp ? path.join(pathtmp, dirname) : dirname;
            if (pathtmp === '') {
                pathtmp = '/';
            }
            if (!fs.existsSync(pathtmp)) {
                fs.mkdirSync (pathtmp)
            }
        });
    }
}

function copyFolderRecursive(src, dst) {
    if( fs.existsSync(src) ) {
        if ( !fs.existsSync(dst) ) {
            mkdirsSync (dst)
        }
        fs.readdirSync(src).forEach(function(file) {
            var curPath = path.join(src, file);
            var dstPath = path.join(dst, file);
            if(fs.statSync(curPath).isDirectory()) { // recurse
                copyFolderRecursive(curPath, dstPath);
            } else {
                copyFile (curPath, dstPath);
            }
        });
    }
}

Promise.all (promises).then (result => {
    deleteFolderRecursive (compiledDir);
    process.exit(0);
}).catch (reason => {
    console.error (reason);
    process.exit(-1);
});


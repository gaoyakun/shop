import { app, initializeApp } from './app';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../lib/config';
import { Server } from '../lib/servermgr';

initializeApp ().then (() => {
    const useHttps = Config.useSSL;
    
    const options = useHttps ? {
        key: fs.readFileSync(Config.sslKeyFile),
        cert: fs.readFileSync(Config.sslCertFile)
    } : {};

    /**
     * Get port from environment and store in Express.
     */
    const httpPort = normalizePort(Config.serverPort);

    /**
     * Create HTTP(s) server.
     */
    const server = useHttps ? https.createServer(options, app) : http.createServer(app);
    
    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(httpPort);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val: any) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind = typeof httpPort === 'string'
            ? 'Pipe ' + httpPort
            : 'Port ' + httpPort;

        // handle specific listen errors with friendly messages
        switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr!.port;
        console.log('Listening on ' + bind);
        setTimeout (() => {
            Server.startCli ((cmd:string, args: string[]) => {
                console.log (`${cmd}(${args.join(',')})`);
            });
        }, 1000);
    }

}).catch (err => {
    console.log (err);
    process.exit (1);
});

'use strict';
/**
 * Usage: node index.js
 *
 * Act as a regular HTTP proxy, but replace or modify some responses.
 *
 * Used for development of front-end javascript, when all the website's
 * environment can't be reproduced locally easily.
 *
 */

var http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    path = require('path'),
    fs = require('fs')

var homedir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

var argv = require('optimist')
    .options('c', {
        alias: 'config',
        default: path.join(homedir, '.magicproxyrc'),
    })
    .options({
        alias: 'plugin',
        default: [],
    })
    .options('p', {
        alias: 'port',
    })
    .argv;

var config = {};
updateConfig();

function updateConfig() {
    if (argv.config) {
        config = JSON.parse(fs.readFileSync(argv.config), {encoding: 'utf-8'});
    }
}

var plugins = [
    './replace.js',
    './fakeDir.js',
    './empty.js',
    './markup.js',
]

var pluginsInArgv = typeof argv.plugin === 'string' ? [argv.plugin] : argv.plugin

plugins = plugins
    .concat(pluginsInArgv || [])
    .concat(config.plugins || [])

var proxy = new httpProxy.RoutingProxy()

plugins = plugins.map(require)

/* Listen to HTTP requests */
http.createServer(function (req, res) {
    updateConfig();

    /* Check if any plugin wishes to intercept and respond to the request */
    var didRespond = plugins.some(function (plugin) {
        return plugin.proxy(req, res, {
            config: config
        })
    })

    /* Else, proxy the request over to the server */
    if (!didRespond) {
        var parsed = url.parse(req.url)
        proxy.proxyRequest(req, res, {
            host: parsed.hostname,
            port: parsed.port || 80,
        })
    }
}).listen(argv.port || config.port || 8080)


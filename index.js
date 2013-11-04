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
    fs = require('fs'),
    underscore = require('underscore')

var _ = underscore;

_.mixin({
    concat: function (arr, other) {
        return _([].concat.call(arr, other || []))
    }
})

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

var defaultPlugins = [
    './replace.js',
    './fakeDir.js',
    './empty.js',
    './markup.js',
    './cacheBreaker.js',
]

var plugins;

var pluginsInArgv = typeof argv.plugin === 'string' ? [argv.plugin] : argv.plugin

var config = {};

updateConfig();

function updateConfig() {
    // TODO: set up watches and check file changed. Return early if flag not checked.

    try {
        config = JSON.parse(fs.readFileSync(argv.config), {encoding: 'utf-8'});
    } catch(e) {
        console.log('Warning: Configuration file (%s) not found', argv.config)
    }

    plugins = _([])
        .concat(defaultPlugins)
        .concat(pluginsInArgv || [])
        .concat(config.plugins || [])
        .uniq()
        .map(require)
}

var proxy = new httpProxy.RoutingProxy()

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


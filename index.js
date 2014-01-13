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

var ok = require('assert');
var http = require('http'),
    https = require('https'),
    watch = require('node-watch'),
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

function updateConfig() {
    /* jshint evil:true */
    // TODO: set up watches and check file changed. Return early if flag not checked.

    try {
        config = eval('(' +
            fs.readFileSync(argv.config, {encoding: 'utf-8'}) +
        ')');
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

watch(argv.config, {recursive: false}, updateConfig);
updateConfig();

var proxy = new httpProxy.RoutingProxy()

function tryRespond(req, res) {
    return plugins.some(function (plugin) {
        if (plugin.v2_proxy) {
            // V2 API
            var cfg = config[plugin.configName || plugin.name]
            .filter(function (op) {
                return (
                    op.url && (req.url === op.url) ||
                    typeof op.urlRegExp === 'string'    && (new RegExp(op.urlRegExp)).test(req.url) ||
                    op.urlRegExp instanceof RegExp      && op.urlRegExp.test(req.url) ||
                    typeof plugin.v2_test === 'function'&& plugin.v2_test());
            })
            .filter(function (op) {
                return plugin.v2_proxy(req, res);
            })
            return plugin.v2_proxy(cfg);
        } else if (plugin.proxy) {
            // V1 API
            return plugin.proxy(req, res, {
                config: config
            })
        } else {
            ok(false, 'plugin ' + (plugin.name || plugin) + ' does not have a "proxy_v2" or "proxy" function');
        }
    })
}

/* Listen to HTTP requests */
http.createServer(function (req, res) {
    /* Check if any plugin wishes to intercept and respond to the request */
    var didRespond = tryRespond(req, res);

    /* Else, proxy the request over to the server */
    if (!didRespond) {
        var parsed = url.parse(req.url)

        // Protect Wordpress, Wikipedia and other sites from their naiveté
        // in assuming that the URIs in the path field aren't absolute.
        // http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html#sec5.1.2
        req.url = req.url.replace(/.*?\/\/.*?\//, '/');

        proxy.proxyRequest(req, res, {
            host: parsed.hostname,
            port: parsed.port || 80,
        })
    }
}).listen(argv.port || config.port || 8080)


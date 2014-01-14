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
    watch = require('node-watch'),
    harmon = require('./vendor/harmon'),
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

/* Listen to HTTP requests */
httpProxy.createServer(function staticPlugins(req, res, next) {
    var didRespond = plugins.some(function (plugin) {
        return plugin.proxy && plugin.proxy(req, res, {
            config: config
        })
    })
    if (!didRespond) {
        return next()
    }
}, function harmonPlugins(req, res, next) {
    var harmonActions = plugins
        .map(function (plugin) {
            return plugin.harmon &&
                plugin.harmon(req, res, {config: config})
        })

    // Remove falsy values and empty arrays, making it
    // possible to return an array of actions, and letting
    // plugins cancel
    harmonActions = _.flatten(_.compact(harmonActions), true /* shallow */)

    if (harmonActions.length) {
        return harmon(null, harmonActions)(req, res, next)
    } else {
        return next()
    }
}, function (req, res, next) {
    var parsed = url.parse(req.url)

    // Protect Wordpress, Wikipedia and other sites from their naiveté
    // in assuming that the URIs in the path field aren't absolute.
    // http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html#sec5.1.2
    req.url = req.url.replace(/.*?\/\/.*?\//, '/');

    proxy.proxyRequest(req, res, {
        host: parsed.hostname,
        port: parsed.port || 80,
    })
}).listen(argv.port || config.port || 8080)


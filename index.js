'use strict';
/**
 * Usage: node index.js
 *
 * Act as a regular HTTP proxy, but replace or modify some responses.
 *
 * Used for development of front-end javascript, when all the website's
 * environment can't be reproduced locally easily.
 *
 * Shit's currently configurated hardcoded-ly!
 */

var http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    path = require('path'),
    fs = require('fs')

// Local deps
var replace = require('./replace.js'),
    empty = require('./empty.js'),
    markup = require('./markup.js')

var proxy = new httpProxy.RoutingProxy()

http.createServer(function (req, res) {
    if (replace.replace(req, res)) {
        return;  // We are done here. replace.replace responds.
    } else if (empty.empty(req, res)) {
        return;
    } else if (markup.markup(req, res)) {
        return
    } else {
        var parsed = url.parse(req.url)
        proxy.proxyRequest(req, res, {
            host: parsed.hostname,
            port: parsed.port || 80,
        })
    }
}).listen(7777)


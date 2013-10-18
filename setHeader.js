'use strict'

/*
 * Adds a header to responses matching an URL. Default matches all urls
 */

module.exports = {
    proxy: setHeader
}

var fs = require('fs'),
    url = require('url')

/**
 * // in ~/.magicproxyrc:
 * setHeader: [
 *     {
 *          "url": "http://www.example.com/my/endpoint"
 *          "header": "Content-Type",
 *          "value": "text/urmom"
 *     },
 * ]
 */

function setHeader(req, res, plugin) {
    (plugin.config.setHeader || [])
    .filter(function (headerAdd) {
        return req.url === headerAdd.url;
    })
    .forEach(function (headerAdd) {
        var res_end = res.end
        var res_write = res.write
        var res_writeHead = res.writeHead
        var written = ''
        res.writeHead = new Function
        res.write = function (s) {written += s}
        res.end = function (s) {
            res.setHeader(headerAdd.header, headerAdd.value)
            res_writeHead.call(res, res.statusCode)
            res_write.call(res, written)
            res_write.call(res, s || '')
            res_end.call(res)
        }
    })
}


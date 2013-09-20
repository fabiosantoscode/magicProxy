/*
 * This module checks whether it is necessary to replace the response, based upon an input URI
 */

module.exports = {
    proxy: replace
}

var fs = require('fs'),
    url = require('url')

/**
 * // in ~/.magicproxyrc:
 * replace: [
 *     {
 *         replace: 'http://what.to/replace',  // You can also use replaceRegExp
 *         withFile: '/path/to/replacement.js',  // You can also use with, a string containing the file contents.
 *         contentType: 'content/type',  // dafaults to text/plain
 *     },
 * ]
 */

function replace(req, res, plugin) {
    var replacements = plugin.config.replace || [];
    return replacements.some(function (rep) {
        if (match(rep, url.parse(req.url))) {
            respond(res, rep)
            return true
        }
    })
}

function match(rep, url) {
    if (rep.replace) {
        return url.href === rep.replace
    } else if (rep.replaceRegExp) {
        return url.href.test(new RegExp(rep.replaceRegExp));
    }
}

function respond(res, rep) {
    res.setHeader('Content-type', rep.contentType || 'text/plain')
    res.end(rep.with || fs.readFileSync(rep.withFile))
}


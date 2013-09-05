/*
 * This module checks whether it is necessary to replace the response, based upon an input URI
 */

module.exports = {
    replace: replace
}

var url = require('url'),
    fs = require('fs')

var replacements = [
    {
        replace: 'http://what.to/replace',
        withFile: '/path/to/replacement.js',
        contentType: 'content/type',
    },
]

function replace(req, res) {
    var parsedUrl = url.parse(req.url)
    var rep
    for (var i = 0, len = replacements.length; i < len; i++) {
        rep = replacements[i];
        if (match(rep, url)) {
            respond(res, rep)
            return true
        }
    }
}

function match(rep, url) {
    if (rep.replace) {
        return url.href === rep.replace
    } else if (rep.replaceRegExp) {
        return url.href.test(rep.replaceRegExp);
    }
}

function respond(res, rep) {
    res.setHeader('Content-type', rep.contentType || 'text/plain')
    res.end(rep.with || fs.readFileSync(rep.withFile))
}


/*
 * This module checks whether it is necessary to replace the response, based upon an input URI
 */

module.exports = {
    proxy: replace
}

var fs = require('fs'),
    url = require('url'),
    mime = require('mime')

/**
 * // in ~/.magicproxyrc:
 * replace: [
 *     {
 *         replace: 'http://what.to/replace',  // You can also use replaceRegExp
 *         withFile: '/path/to/replacement.js',  // You can also use the "with" option, a string containing the file contents.
 *         contentType: 'content/type',  // dafaults to text/plain
 *     },
 * ]
 */

function replace(req, res, plugin) {
    var replacements = plugin.config.replace || [];
    return replacements.some(function (rep) {
        return respond(url.parse(req.url), res, rep);
    })
}

function respond(url, res, rep) {
    var matches
    var re

    if (rep.replace) {
        matches = url.href === rep.replace
    } else if (rep.replaceRegExp) {
        re = new RegExp(rep.replaceRegExp)
        matches = re.exec(url.href);
    }

    if (!matches) { return; }

    if (re && rep.withFile) {
        // replacements
        rep.withFile = rep.withFile.replace(/\$(\d)/g, function (_, number) {
            return matches[number];
        });
    }

    if (!rep.contentType && rep.withFile) {
        rep.contentType = mime.lookup(rep.withFile);
    }

    var responseStr
    if (!rep.with) {
        try {
            responseStr = fs.readFileSync(rep.withFile)
        } catch(e) {
            res.statusCode = 404
            responseStr = [
                'Error loading file', rep.withFile, e].join(' ');
        }
    } else {
        responseStr = rep.with
    }

    if (!responseStr) {
        responseStr = '/* magicProxy: "replace" directive missing "with" or "withFile" options */'
    }

    res.setHeader('Content-type', rep.contentType || 'text/plain')
    res.end(responseStr)

    return true;  // responded
}


/* jshint asi:true */

/**
 * Empty module: When encountering a certain file, return an empty response!
 */

module.exports = {
    empty: empty
}

var url = require('url')

var targets = [
    {
        href: 'http://example.com/js/annoyingscript.js',
        contentType: 'text/javascript',
    }
]

function empty(req, res) {
    return targets.some(function (target) {
        if (url.parse(req.url).href === target.href) {
            res.setHeader('content-type', target.contentType || 'text/plain');
            res.end('')
            return true
        }
    })
}


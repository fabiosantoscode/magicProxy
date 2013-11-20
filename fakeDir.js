/*
 * Fakes a server directory with static files locally, but serves files locally.
 */

module.exports = {
    proxy: fakeDir
}

var fs = require('fs'),
    url = require('url'),
    path = require('path'),
    mime = require('mime')

/**
 * // in ~/.magicproxyrc:
 * fakeDir: [
 *     {
 *         url: 'http://my-site.com/static/js',
 *         dir: '/path/to/local/js/folder',
 *         contentType: 'content/type',  // dafaults to text/plain
 *     },
 * ]
 */

function fakeDir(req, res, plugin) {
    var remoteUrl = url.parse(req.url)
    return (plugin.config.fakeDir || [])
        .filter(function (fakeDir) {
            return req.url.indexOf(path.dirname(fakeDir.url)) === 0
        })
        .some(function (fakeDir) {
            var relativePath = path.relative(fakeDir.url, req.url)
            var absPath = path.join(fakeDir.dir, relativePath)
            if (!fakeDir.contentType) {
                fakeDir.contentType = mime.lookup(absPath) || 'text/plain';
            }
            res.setHeader('Content-Type', fakeDir.contentType)
            fs.readFile(absPath, function (err, data) {
                if (err) throw err
                res.end(data)
            })
            return true
        })
}


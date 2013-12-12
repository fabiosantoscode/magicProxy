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
    var operations = plugin.config.fakeDir || []

    var fakeDir = findOp(req, operations)

    if (!fakeDir) {
        return false;
    }

    var relativePath = path.relative(fakeDir.url, req.url)
    var absPath = path.join(fakeDir.dir, relativePath)

    if (!fakeDir.contentType) {
        fakeDir.contentType = mime.lookup(absPath) || 'text/plain';
    }

    respondWith(fakeDir, res, absPath);

    return true;
}

function findOp(req, operations) {
    for (var i = 0, len = operations.length; i < len; i++) {
        if (req.url.indexOf(path.dirname(operations[i].url)) === 0) {
            return operations[i]
        }
    }
    return null;
}

function respondWith(fakeDir, res, absPath) {
    res.setHeader('Content-Type', fakeDir.contentType)
    fs.readFile(absPath, function (err, data) {
        if (err) {
            // Error could be that the user is looking at a dir.
            // Servers have index files for that.
            if (err.code !== 'EISDIR' || !fakeDir.indexFile) {
                return onIOError(res, err);
            } else {
                var index = fakeDir.indexFile;
                index = path.join(absPath, index)
                return respondWith(fakeDir, res, index)
            }
        }

        res.end(data)
    })
}

function onIOError(res, err) {
    res.setHeader('Content-Type', 'text/plain')
    res.statusCode = 404
    res.write('MagicProxy fakeDir IO error');
    console.error(err);
    res.write(err.toString());
    return res.end()
}

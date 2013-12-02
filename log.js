/**
 * Logger module. Logs requests.
 */

module.exports = {
    proxy: log
}

function log(req, res, plugin) {
    if (!plugin.config.log || !plugin.config.log.active) {
        return
    }

    var _end = res.end
    res.end = function () {
        console.log('%s\t%s\t(%s)', req.method, res.statusCode, req.url)
        if (res.statusCode === 302 || res.statusCode === 301) {
            console.log('\t=>:\t%s', res._headers['location'])
        }
        _end.apply(this, [].slice.call(arguments))
    }
}


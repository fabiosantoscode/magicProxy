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
        _end.apply(this, [].slice.call(arguments))
    }
}


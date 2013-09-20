/**
 * Logger module. Logs requests.
 */

module.exports = {
    proxy: log
}

function log(req, res) {
    var timeout = null
    var _end = res.end
    res.end = function () {
        console.log('%s\t%s\t(%s)', req.method, res.statusCode, req.url)
        clearTimeout(timeout)
        _end.apply(this, [].slice.call(arguments))
    }
    timeout = setTimeout(function () {
        console.log('TIMEOUT\t%s\t%s\t(given up waiting)', req.method, req.url)
    }, 3000)
}


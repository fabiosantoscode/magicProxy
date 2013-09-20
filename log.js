/**
 * Logger module. Logs requests.
 */

module.exports = {
    proxy: log
}

function log(req, res) {
    var timeout = null
    res.on('end', function () {
        console.log('%s: %s to %s', res.statusCode, req.verb, req.url)
        clearTimeout(timeout)
    })
    timeout = setTimeout(function () {
        console.log('TIMEOUT: giving up waiting for response of %s to %s', req.verb, req.url)
    }, 3000)
}


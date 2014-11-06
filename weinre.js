
var ui = require('./ui.js')
var url = require('url')
var markup = require('./markup.js')
var weinre = require('weinre')

module.exports = {
    proxy: weinreInjector
}

var port = 49369
var weinreRunning = false

ui.tabs.push({
    label: 'weinres',
    link: '/weinres'
})

function startWeinreForm(req, res) {
    res.setHeader('content-type', 'text/html;charset=utf-8')
    res.write('<form method="post" action="/weinres">')
    res.write('    <button type="submit">')
    res.write('         Start weinre server on 0.0.0.0:' + port + ' (access it on weinre.local, cause magicproxy will proxy it.)')
    res.write('    </button>')
    res.write('</form>')
    res.end()
}

ui.router.get('/weinres', function (req, res) {
    if (!weinreRunning) {
        startWeinreForm(req, res)
    } else {
        res.writeHead(302, { location: 'http://weinre.local/' })
        res.end()
        //res.end('<iframe src="http://weinre.local/"></iframe>');
    }
})

ui.router.post('/weinres', function (req, res) {
    weinre.run({
        boundHost: '-all-',
        httpPort: port,
        verbose: true,
        debug: true, 
        readTimeout: 120,
        deathTimeout: 120
    })

    weinreRunning = true

    res.writeHead(302, { location: 'http://weinre.local/' })
    res.end()
})

function weinreInjector(req, res, plugin) {
    var remoteUrl = url.parse(req.url)

    if (remoteUrl.host === 'weinre.local') {
        req.url = req.url.replace(/weinre.local/, 'localhost:' + port)
        return false;
    }

    if (!weinreRunning) {
        return false;
    }

    return;  // TODO
    markup.markup(req, res, [
        {
            insert: {
                after: 'title',  // TODO append to <head> instead
                markup: '<script src="http://weinre.local/target/target-script-min.js#anonymous"></script>' 
            }
        }
    ])
}


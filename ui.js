
var fs = require('fs')
var url = require('url')
var express = require('express')

module.exports = {
    proxy: uiProxy,
    tabs: [
        {
            label: 'status',
            link: '/status',
        }
    ],
    router: new express.Router()
}

function uiProxy(req, res, plugin) {
    var remoteUrl = url.parse(req.url)

    if (remoteUrl.host !== 'magicproxy.local') {
        return false;
    }

    module.exports.router.middleware(req, res)

    return true;
}

module.exports.router.get('/', function (req, res) {
    res.write(fs.readFileSync('ui.html'))

    res.write('<nav id="tabs">' +
        module.exports.tabs.map(function (tab) {
            var ret =
                '<a href="' + ('/' + tab.label || tab.link) + '" ' +
                'target="iframe"' +
                '>' +
                tab.label + '</a>';
            return ret
        }).join('') +
        '</nav>')

    res.end('<iframe name="iframe" src="/status"></iframe>')
})

module.exports.router.get('/status', function (req, res) {
    res.end('<img src="http://38.media.tumblr.com/dc2acffbea837dc5277bb1b469aafbb7/tumblr_n7u8czdwFI1qzs5cqo1_500.gif">')
})


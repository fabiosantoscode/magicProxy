

module.exports = {
    proxy: uiProxy
}

var fs = require('fs')
var url = require('url')
var express = require('express')


function uiProxy(req, res, plugin) {
    var remoteUrl = url.parse(req.url)

    if (remoteUrl.host !== 'magicproxy.local') {
        return false;
    }

    respond(req, res)

    return true;
}

function respond(req, res) {
    router.middleware(req, res)
}

var router = new express.Router()

router.get('/', function (req, res) {
    res.end(fs.readFileSync('ui.html'))
})


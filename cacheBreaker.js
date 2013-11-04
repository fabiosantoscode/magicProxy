/**
 * The purpose of this module is to insert cache breakers (?cache_breaker=[random number]) into `<script>`, `<img>`, `<style>`, etc. tags, which SOME browsers will always cache. These browsers don't have an option to disable caching, so here goes.
 */

module.exports = {
    proxy: cacheBreaker
}

var cheerio = require('cheerio')
/*         :(               */
/*        :(              */
/*       :(             */
var url = require('url')

function cacheBreaker(req, res, plugin) {
    /* these lines need to be in the plugin system:    vvvvv */
    var operations = plugin.config.cacheBreaker || [];

    var relevantOps = operations.filter(function (op) {
        var href = url.parse(req.url).href
        return href === op.href || (op.hrefRegExp && (new RegExp(op.hrefRegExp)).test(href))
    })

    if (relevantOps.length === 0) { return }
    /* ^^^^^       let's crush them and stuff          ^^^^^ */

    var modifiedHTML = ''
    var res_end = res.end
    var res_write = res.write
    res.write = function (d) { modifiedHTML += d || '' }
    res.end = function (d) {
        modifiedHTML += d || ''
        res_write.call(res, putBreakers(modifiedHTML))
        res_end.call(res, '')
    }
}

var breakers = {
    script: 'src',
    link: 'href',
    img: 'src',
}

/* small breakers are a concern on IE where the URL length is limited. */
var breakerParam = 'mp_brkr'
var breakerVal = Math.random().toString(16).substr(2, 8)

function putBreakers(html) {
    var $ = cheerio.load(html)

    Object.keys(breakers).forEach(function (selector) {
        var attrName = breakers[selector]  // see dat object above
        var resourceUrl = $(selector).attr(attrName)
        console.log(resourceUrl)
        if (!resourceUrl) { return; }
        resourceUrl = url.parse(resourceUrl, true)
        
        resourceUrl.query[breakerParam] = breakerVal

        $(selector).attr(attrName, url.format(resourceUrl))
    })

    return $.html()
}


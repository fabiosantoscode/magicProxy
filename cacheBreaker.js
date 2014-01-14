/**
 * The purpose of this module is to insert cache breakers (?cache_breaker=[random number]) into `<script>`, `<img>`, `<style>`, etc. tags, which SOME browsers will always cache. These browsers don't have an option to disable caching, so here goes.
 */

module.exports = {
    harmon: harmonCacheBreaker
}

var url = require('url')

/* small breakers are a concern on IE where the URL length is limited. */
var breakerParam = '__brkr'
var getBreakerVal = function () { return Math.random().toString(16).substr(2, 6) }

var elementsToBreak = 'script,link,img,iframe';
var attrsToBreak = ['href', 'src'];

function harmonCacheBreaker(req, res, plugin) {
    var operations = plugin.config.cacheBreaker || [];

    return operations
    /* these lines need to be in the plugin system:    vvvvv */
        .filter(function (op) {
            var href = url.parse(req.url).href
            return href === op.href || (op.hrefRegExp && (new RegExp(op.hrefRegExp)).test(href))
        })
    /* ^^^^^       let's crush them and stuff          ^^^^^ */
        .map(function (op) {
            return {
                query: op.query || op.selector || elementsToBreak,
                func: function (elem) {
                    attrsToBreak.forEach(function (attrName) {
                        changeOneAttribute(elem, attrName);
                    })
                }
            }
        });
}

function changeOneAttribute(elem, attrName) {
    if (elem.getAttribute) {  // trumpet latest
        elem.getAttribute(attrName, function (attr) {
            if (!attr) return;
            elem.setAttribute(breakerParam, addBreaker(attr));
        });
    } else {  // trumpet old
        if (attrName in elem.attributes) {
            elem.attributes[attrName] = addBreaker(elem.attributes[attrName]);
        }

        elem.update(function (html) { console.log(html); return html }, elem.attributes)
    }
}

function addBreaker(urlString) {
    var resourceUrl = url.parse(urlString, true)
    resourceUrl.query[breakerParam] = getBreakerVal()
    delete resourceUrl.search
    return url.format(resourceUrl);
}


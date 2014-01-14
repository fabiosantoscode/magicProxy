/**
 * The purpose of this module is to insert cache breakers (?cache_breaker=[random number]) into `<script>`, `<img>`, `<style>`, etc. tags, which SOME browsers will always cache. These browsers don't have an option to disable caching, so here goes.
 */

module.exports = {
    harmon: harmonCacheBreaker,
    name: 'cacheBreaker'
}

var url = require('url')

/* small breakers are a concern on IE where the URL length is limited. */
var breakerParam = '__brkr'
var getBreakerVal = function () { return Math.random().toString(16).substr(2, 6) }

var elementsToBreak = 'img,script,link,iframe';
var attrsToBreak = ['href', 'src'];

function harmonCacheBreaker(req, res, op) {
    return {
        query: op.query || op.selector || elementsToBreak,
        func: function (elem) {
            attrsToBreak.forEach(function (attrName) {
                changeOneAttribute(elem, attrName);
            })
        }
    }
}

function changeOneAttribute(elem, attrName) {
    elem.getAttribute(attrName, function (attr) {
        if (!attr) return '';
        elem.setAttribute(attrName, addBreaker(attr));
    });
}

function addBreaker(urlString) {
    var resourceUrl = url.parse(urlString, true)
    resourceUrl.query[breakerParam] = getBreakerVal()
    delete resourceUrl.search
    return url.format(resourceUrl);
}


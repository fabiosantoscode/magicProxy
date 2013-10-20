/**
 * insert, delete or replace markup
 */

module.exports = {
    proxy: markup
}

var cheerio = require('cheerio')
/*         :(               */
/*        :(              */
/*       :(             */
var url = require('url')
var fs = require('fs')

var operations = [
    {
        href: 'http://example.com/',
        insert: {
            markupFile: '/path/to/chunk-to-insert.html',
            after: '#main h1',
        }
    },
]

function markup(req, res) {
    var relevantOps = operations.filter(function (op) {
        return url.parse(req.url).href === op.href
    })
    if (relevantOps.length === 0) { return }

    var modifiedHTML = ''
    var res_end = res.end
    var res_write = res.write
    res.write = function (d) { modifiedHTML += d }
    res.end = function (d) {
        if (d) { modifiedHTML += d }
        res_write.call(res, doOps(relevantOps, modifiedHTML))
        res_end.call(res, '')
    }
}

function doOps(relevantOps, html) {
    var $ = cheerio.load(html)
    relevantOps.forEach(function (opt) {
        if (opt.insert) {
            if (opt.insert.after) {
                $(opt.insert.after).after(getMarkup(opt.insert))
            } else if (opt.insert.before) {
                $(opt.insert.before).before(getMarkup(opt.insert))
            } else {
                throw new Error('opt.insert is missing one of "after" options')
            }
        } else if (opt.remove) {
            $(opt.remove).remove()
        } else {
            throw new Error('operation not found!')
        }
    })
    return $.html()
}

function getMarkup(opt) {
    if (opt.markup) {
        return opt.markup
    } else if (opt.markupFile) {
        return fs.readFileSync(opt.markupFile)
    } else {
        throw 'define a `markup` option'
    }
}


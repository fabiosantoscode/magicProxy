
/**
 * insert, delete or replace markup
 */

module.exports = {
    proxy: markup
}

var cheerio = require('cheerio')
var url = require('url')
var fs = require('fs')

function markup(req, res, plugin) {
    var operations = plugin.config.markup || [];

    var relevantOps = operations.filter(function (op) {
        var href = url.parse(req.url).href
        return href === op.href || (op.hrefRegExp && (new RegExp(op.hrefRegExp)).test(href))
    })

    if (relevantOps.length === 0) { return }

    var modifiedHTML = ''
    var res_end = res.end
    var res_write = res.write
    res.write = function (d) { modifiedHTML += d || '' }
    res.end = function (d) {
        modifiedHTML += d || ''
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
        } else if (opt.replace) {
            $(opt.replace.what).html(getMarkup(opt.replace))
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


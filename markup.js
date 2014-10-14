
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
    var res_writeHead = res.writeHead
    var writeHeadArgs;
    var headers = {};
    res.writeHead = function (x, heads1, heads2/*...*/) {
        writeHeadArgs = [].slice.call(arguments)

        headers =
            (heads1 && typeof heads1 === 'object') ? heads1 :
            (heads2 && typeof heads1 === 'object') ? heads2 : null;
        if (headers) {
            // going to override these
            delete headers['Content-Type'];
            delete headers['Content-Length'];
            delete headers['Accept-Encoding'];
        }
    }
    res.write = function (d) { modifiedHTML += d || '' }
    res.end = function (d) {
        try {
            modifiedHTML = doOps(relevantOps, modifiedHTML + (d || ''))
        } catch (e) {
            console.error('MagicProxy markup plugin: ', e);
        }
        //res.setHeader('Content-Type', 'text/html;charset=utf-8');
        // res.setHeader('Content-Length', Buffer.byteLength(modifiedHTML, 'utf-8'));
        if (writeHeadArgs) {
            res_writeHead.call(res, writeHeadArgs);
        }
        res_write.call(res, modifiedHTML, 'utf-8')
        res_end.call(res)
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
            $(opt.remove.what || opt.remove).remove()
        } else if (opt.replace) {
            var $what = $(opt.replace.what);
            $what.after(getMarkup(opt.replace));
            $what.remove();
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
        throw 'define a `markup` or `markupFile` option'
    }
}


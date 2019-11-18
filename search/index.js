var Vehicle = require('../service');
var find = require('../find');
var user = require('user');
var serand = require('serand');
var utils = require('utils');

var hooks = {
    'query.manufacturedAt.$lte': function (val) {
        return new Date(val).toISOString();
    },
    'query.manufacturedAt.$gte': function (val) {
        return new Date(val).toISOString();
    },
    'query.price.$lte': function (val) {
        return parseInt(val, 10);
    },
    'query.price.$gte': function (val) {
        return parseInt(val, 10);
    },
    'count': function (val) {
        return parseInt(val, 10);
    },
    'direction': function (val) {
        return parseInt(val, 10);
    },
    'sort.updatedAt': function (val) {
        return parseInt(val, 10);
    },
    'sort.id': function (val) {
        return parseInt(val, 10);
    }
};

var prepare = function (o) {
    Object.keys(hooks).forEach(function (path) {
        var val;
        var part;
        var hook = hooks[path];
        var parts = path.split('.');
        var pointer = o;
        while (parts.length) {
            part = parts.shift();
            val = pointer[part];
            if (!val) {
                break;
            }
            if (!parts.length) {
                pointer[part] = hook(val);
                break;
            }
            pointer = val;
        }
    });
    return o;
};

var render = function (ctx, container, paging, query, done) {
    Vehicle.find({
        query: prepare(query),
        resolution: '288x162'
    }, function (err, vehicles, links) {
        if (err) {
            return done(err);
        }
        var page = ++paging.total;
        var pageBox = $('<div class="vehicles-search-page" data-page="' + page + '"></div>');
        find(ctx, {
            id: container.id,
            sandbox: pageBox
        }, {
            prefix: utils.resolve('autos:///vehicles'),
            vehicles: vehicles,
            size: 4
        }, function (err, clean) {
            if (err) {
                return done(err);
            }
            container.sandbox.append(pageBox);
            done(null, clean, links);
        });
    });
};

module.exports = function (ctx, container, options, done) {
    var loadable = options.loadable;
    var cleaners = [];
    var paging = {total: 0};
    render(ctx, container, paging, options.query, function (err, clean, links) {
        if (err) {
            return done(err);
        }
        if (!loadable) {
            return done(null, clean);
        }
        cleaners.push(clean);

        var activePage = 0;

        var findActivePage = function () {
            return $('.vehicles-search-page', container.sandbox).mostVisible().data('page');
        };

        var scrolled = function (o) {
            var active = findActivePage();
            if (active === activePage) {
                return;
            }
            activePage = active;
            utils.emit('footer', 'pages', paging.total, findActivePage() || 1);
        };

        var scrolledDown = function () {
            if (!links.next) {
                return;
            }
            render(ctx, container, paging, links.next.query, function (err, clean, linkz) {
                if (err) {
                    return console.error(err);
                }
                utils.emit('footer', 'pages', paging.total, findActivePage() || 1);
                cleaners.push(clean);
                links = linkz;
            });
        };

        //var url = '/vehicles?' + utils.toQuery(links.prev.query);
        //serand.redirect(url);

        done(null, {
            clean: function () {
                utils.off('serand', 'scrolled', scrolled);
                utils.off('serand', 'scrolled down', scrolledDown);
                cleaners.forEach(function (clean) {
                    clean();
                });
            },
            ready: function () {
                utils.on('serand', 'scrolled', scrolled);
                utils.on('serand', 'scrolled down', scrolledDown);
            }
        });
    });
};

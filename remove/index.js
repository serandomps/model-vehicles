var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Vehicle = require('../service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-remove'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    dust.render('vehicles-remove', {}, function (err, out) {
        if (err) {
            return done(err);
        }
        var el = sandbox.append(out);
        console.log(out)
        $('.remove', el).on('click', function () {
            Vehicle.remove(options.id, serand.none);
        })
        done(null, serand.none);
    });
};

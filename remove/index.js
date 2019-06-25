var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Vehicle = require('../service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-remove'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicle.findOne({id: options.id}, function (err, vehicle) {
        if (err) return done(err);
        dust.render('vehicles-remove', serand.pack(vehicle, container), function (err, out) {
            if (err) {
                return done(err);
            }
            var el = sandbox.append(out);
            $('.remove', el).on('click', function () {
                Vehicle.remove(vehicle, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    serand.redirect('/vehicles');
                });
            });
            done(null, serand.none);
        });
    });
};

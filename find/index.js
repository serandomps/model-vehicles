var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Vehicle = require('../service');

dust.loadSource(dust.compile(require('./template'), 'model-vehicles-find'));

var fetch = function (options, done) {
    if (options.vehicles) {
        return done(null, options);
    }
    var o = _.cloneDeep(options);
    o.prefix = utils.resolve('autos:///vehicles');
    Vehicle.find(o, function (err, vehicles) {
        if (err) {
            return done(err);
        }
        vehicles.forEach(function (vehicle) {
            if (o.editable) {
                vehicle._.edit = true;
            }
        });
        o.vehicles = vehicles;
        done(null, o);
    });
};

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    fetch(options, function (err, o) {
        if (err) {
            return done(err);
        }
        dust.render('model-vehicles-find', serand.pack(o, container), function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, function () {
                $('.model-vehicles-find', sandbox).remove();
            });
        });
    });
};

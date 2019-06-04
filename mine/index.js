var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Vehicle = require('../service');
var list = require('../find');

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    options = options || {}
    options.user = ctx.token && ctx.token.user.id
    Vehicle.find({
        query: options,
        resolution: '288x162'
    }, function (err, vehicles) {
        if (err) {
            return done(err);
        }
        vehicles.forEach(function (vehicle) {
            vehicle._.edit = true;
        });
        list(ctx, container, {
            vehicles: vehicles,
            title: 'My Vehicles',
            size: 3
        }, done);
    });
};

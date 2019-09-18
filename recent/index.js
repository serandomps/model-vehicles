var Vehicle = require('../service');
var list = require('../find');

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicle.find({
        query: options,
        resolution: '288x162'
    }, function (err, vehicles) {
        if (err) {
            return done(err);
        }
        list(ctx, container, {
            vehicles: vehicles,
            title: 'Recently Added',
            secondary: true,
            size: 12
        }, done);
    });
};

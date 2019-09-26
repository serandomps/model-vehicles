var Vehicle = require('../service');
var list = require('../find');

module.exports = function (ctx, container, options, done) {
    Vehicle.find({
        query: options.query,
        resolution: '288x162'
    }, function (err, vehicles) {
        if (err) {
            return done(err);
        }
        list(ctx, container, {
            vehicles: vehicles,
            title: options.title || 'Featured',
            secondary: true,
            size: options.size || 4
        }, done);
    });
};

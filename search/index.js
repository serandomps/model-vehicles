var Vehicle = require('../service');
var list = require('../find');

var formatters = {
    price: function (val) {
        return parseInt(val, 10) || null;
    },
    manufacturedAt: function (val) {
        return new Date(val).toISOString();
    }
}

var cast = function (field, val) {
  var formatter = formatters[field];
  if (!formatter) {
      return val;
  }
  return formatter(val);
};

module.exports = function (ctx, container, options, done) {
    var query = options.query;
    var o = {};
    Object.keys(query).forEach(function (name) {
        if (name.indexOf(':') === -1) {
            return o[name] = cast(name, query[name]);
        }
        var parts = name.split(':');
        var q = {};
        var field = parts[0];
        var operator = '$' + parts[1];
        q[operator] = cast(field, query[name]);
        o[field] = o[field] || (o[field] = {});
        _.merge(o[field], q);
    });
    Vehicle.find({
        query: o,
        resolution: '288x162'
    }, function (err, vehicles) {
        if (err) {
            return done(err);
        }
        list(ctx, container, {
            vehicles: vehicles,
            size: 4
        }, done);
    });
};

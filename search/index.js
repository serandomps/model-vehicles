var Vehicle = require('../service');
var find = require('../find');
var user = require('user');

var hooks = {
    price: function (o, val) {
        o.price = parseInt(val, 10) || null;
    },
    'manufacturedAt:lte': function (o, val) {
        o.manufacturedAt = o.manufacturedAt || (o.manufacturedAt = {});
        o.manufacturedAt.$lte = new Date(val).toISOString();
    },
    'manufacturedAt:gte': function (o, val) {
        o.manufacturedAt = o.manufacturedAt || (o.manufacturedAt = {});
        o.manufacturedAt.$gte = new Date(val).toISOString();
    },
    'price:lte': function (o, val) {
        o.price = o.price || (o.price = {});
        o.price.$lte = parseInt(val, 10);
    },
    'price:gte': function (o, val) {
        o.price = o.price || (o.price = {});
        o.price.$gte = parseInt(val, 10);
    },
    'tags:location:province': function (o, val) {
        o.tags = o.tags || (o.tags = []);
        o.tags.push({name: 'location:locations:province', value: val});
    },
    'tags:location:district': function (o, val) {
        o.tags = o.tags || (o.tags = []);
        o.tags.push({name: 'location:locations:district', value: val});
    },
    'tags:location:city': function (o, val) {
        o.tags = o.tags || (o.tags = []);
        o.tags.push({name: 'location:locations:city', value: val});
    },
    'tags:location:postal': function (o, val) {
        o.tags = o.tags || (o.tags = []);
        o.tags.push({name: 'location:locations:postal', value: val});
    }
};

var hook = function (o, field, val) {
  var hook = hooks[field];
  if (!hook) {
      return o[field] = val;
  }
  return hook(o, val);
};

module.exports = function (ctx, container, options, done) {
    var query = options.query;
    var o = {};
    Object.keys(query).forEach(function (name) {
        var val = query[name];
        if (!val) {
            return;
        }
        hook(o, name, query[name]);
    });
    Vehicle.find({
        query: o,
        resolution: '288x162'
    }, function (err, vehicles) {
        if (err) {
            return done(err);
        }
        find(ctx, container, {
            vehicles: vehicles,
            size: 4
        }, done);
    });
};

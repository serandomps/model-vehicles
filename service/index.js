var utils = require('utils');
var Make = require('vehicle-makes').service;
var Model = require('vehicle-models').service;

var cdn = function (size, items, done) {
    if (!size) {
        return done();
    }
    items = items instanceof Array ? items : [items];
    async.each(items, function (item, did) {
        var images = item.images;
        if (!images) {
            return did();
        }
        var o = [];
        var index = 0;
        async.each(images, function (image, pushed) {
            utils.cdn('images', '/images/' + size + '/' + image, function (err, url) {
                if (err) {
                    return pushed(err);
                }
                o.push({
                    id: image,
                    url: url,
                    index: index++
                });
                pushed();
            });
        }, function (err) {
            if (err) {
                return did(err);
            }
            item._.images = o;
            did();
        });
    }, done);
};

var makes = function (vehicles, done) {
    async.each(vehicles, function (vehicle, updated) {
        Make.findOne(vehicle.make, function (err, make) {
            if (err) {
                return updated(err);
            }
            vehicle._.make = make;
            updated();
        })
    }, function (err) {
        done(err, vehicles);
    });
};

var models = function (vehicles, done) {
    async.each(vehicles, function (vehicle, updated) {
        Model.findOne(vehicle.model, function (err, model) {
            if (err) {
                return updated(err);
            }
            vehicle._.model = model;
            updated();
        })
    }, function (err) {
        done(err, vehicles);
    });
};

var update = function (vehicles, options, done) {
    vehicles.forEach(function (vehicle) {
        vehicle._ = {};
    });
    cdn(options.resolution, vehicles, function (err) {
        if (err) {
            return done(err);
        }
        makes(vehicles, function (err, vehicles) {
            if (err) {
                return done(err);
            }
            models(vehicles, function (err, vehicles) {
                if (err) {
                    return done(err);
                }
                done(null, vehicles);
            });
        });
    });
};

exports.findOne = function (options, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('autos:///apis/v/vehicles/' + options.id),
        dataType: 'json',
        success: function (data) {
            update([data], options, function (err, vehicles) {
                done(err, data);
            });
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.find = function (options, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('autos:///apis/v/vehicles' + utils.data(options)),
        dataType: 'json',
        success: function (data) {
            update(data, options, done);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.remove = function (options, done) {
    $.ajax({
        method: 'DELETE',
        url: utils.resolve('autos:///apis/v/vehicles/' + options.id),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

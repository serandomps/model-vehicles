var utils = require('utils');
var Make = require('vehicle-makes').service;

var types = [
    {value: 'bicycle', label: 'Bicycle'},
    {value: 'excavator', label: 'Excavator'},
    {value: 'loader', label: 'Loader'},
    {value: 'bulldozer', label: 'Bulldozer'},
    {value: 'digger', label: 'Digger'},
    {value: 'tractor', label: 'Tractor'},
    {value: 'truck', label: 'Truck'},
    {value: 'cement-mixer', label: 'Cement-mixer'},
    {value: 'crane', label: 'Crane'},
    {value: 'road-roller', label: 'Road-roller'},
    {value: 'motorbike', label: 'Motorbike'},
    {value: 'three-wheeler', label: 'Three-wheeler'},
    {value: 'scooter', label: 'Scooter'},
    {value: 'car', label: 'Car'},
    {value: 'van', label: 'Van'},
    {value: 'suv', label: 'SUV'},
    {value: 'cab', label: 'Cab'},
    {value: 'lorry', label: 'Lorry'},
    {value: 'bus', label: 'Bus'}
];

var driveTypes = [
    {value: 'front', label: 'Front'},
    {value: 'rear', label: 'Rear'},
    {value: 'four', label: '4x4'},
    {value: 'all', label: 'All'},
    {value: 'other', label: 'Other'},
];

types = _.sortBy(types, 'value');

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
        Make.findModel(vehicle.model, function (err, model) {
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

var locations = function (vehicles, done) {
    vehicles.forEach(function (vehicle) {
        var tag = _.find(vehicle.tags, function (tag) {
            return tag.name === 'location:locations:city';
        });
        vehicle._.city = tag.value;
        vehicle._.type = exports.type(vehicle.type);
        vehicle._.driveType = exports.driveType(vehicle.driveType);
    });
    done(null, vehicles);
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
                locations(vehicles, function (err, vehicles) {
                    if (err) {
                        return done(err);
                    }
                    done(null, vehicles);
                });
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

exports.create = function (options, done) {
    $.ajax({
        url: utils.resolve('autos:///apis/v/vehicles' + (options.id ? '/' + options.id : '')),
        type: options.id ? 'PUT' : 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(options),
        success: function (data) {
            update([data], options, done);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.types = function () {
    return types;
};

exports.type = function (value) {
    var type = _.find(types, function (type) {
        return type.value === value;
    });
    return type.label;
};

exports.driveTypes = function () {
    return driveTypes;
};

exports.driveType = function (value) {
    var driveType = _.find(driveTypes, function (type) {
        return type.value === value;
    });
    return driveType.label;
};

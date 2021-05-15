var utils = require('utils');
var Brands = require('model-brands').service;

var types = _.sortBy([
    {value: 'bicycle', label: 'Bicycle'},
    {value: 'excavator', label: 'Excavator'},
    {value: 'loader', label: 'Loader'},
    {value: 'bulldozer', label: 'Bulldozer'},
    {value: 'digger', label: 'Digger'},
    {value: 'tractor', label: 'Tractor'},
    {value: 'truck', label: 'Truck'},
    {value: 'cement-mixer', label: 'Cement Mixer'},
    {value: 'crane', label: 'Crane'},
    {value: 'road-roller', label: 'Road Roller'},
    {value: 'motorbike', label: 'Motorbike'},
    {value: 'three-wheeler', label: 'Three Wheeler'},
    {value: 'scooter', label: 'Scooter'},
    {value: 'car', label: 'Car'},
    {value: 'van', label: 'Van'},
    {value: 'suv', label: 'SUV'},
    {value: 'cab', label: 'Cab'},
    {value: 'lorry', label: 'Lorry'},
    {value: 'bus', label: 'Bus'},
    {value: 'other', label: 'Other'}
], 'value');

var driveTypes = [
    {value: 'front', label: 'Front'},
    {value: 'rear', label: 'Rear'},
    {value: 'four', label: '4x4'},
    {value: 'all', label: 'All'},
    {value: 'other', label: 'Other'}
];

var brands = function (vehicles, done) {
    async.each(vehicles, function (vehicle, updated) {
        updated = utils.later(updated);
        Brands.findOne('vehicles', vehicle.brand, function (err, brand) {
            if (err) {
                return updated(err);
            }
            vehicle._.brand = brand;
            updated();
        });
    }, function (err) {
        done(err, vehicles);
    });
};

var models = function (vehicles, done) {
    async.each(vehicles, function (vehicle, updated) {
        updated = utils.later(updated);
        Brands.findModel('vehicles', vehicle.model, function (err, model) {
            if (err) {
                return updated(err);
            }
            vehicle._.model = model;
            updated();
        });
    }, function (err) {
        done(err, vehicles);
    });
};

var locations = function (vehicles, done) {
    vehicles.forEach(function (vehicle) {
        var tag = _.find(vehicle.tags, function (tag) {
            return tag.server && tag.group === 'location' && tag.name === 'city';
        });
        vehicle._.city = tag && tag.value;
        vehicle._.type = exports.type(vehicle.type);
        vehicle._.driveType = exports.driveType(vehicle.driveType);
    });
    done(null, vehicles);
};

var update = function (vehicles, options, done) {
    vehicles.forEach(function (vehicle) {
        vehicle._ = {};
        vehicle.description = (vehicle.description !== '<p><br></p>') ? vehicle.description : null;
    });
    utils.cdns(vehicles, function (err) {
        if (err) {
            return done(err);
        }
        brands(vehicles, function (err, vehicles) {
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
                    vehicles.forEach(function (vehicle) {
                        if (vehicle.title) {
                            vehicle._.title = vehicle.title;
                            return;
                        }
                        vehicle._.title = vehicle._.brand.title + ' ' + vehicle._.model.title;
                        vehicle._.title += (vehicle.edition ? ' ' + vehicle.edition : '');
                        vehicle._.title += ' ' + moment(vehicle.manufacturedAt).year();
                    });
                    done(null, vehicles);
                });
            });
        });
    });
};

exports.findOne = function (options, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('apis:///v/vehicles/' + options.id),
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
        url: utils.resolve('apis:///v/vehicles' + utils.toData(options.query)),
        dataType: 'json',
        success: function (data, status, xhr) {
            update(data, options, function (err, data) {
                if (err) {
                    return done(err);
                }
                var o;
                var query;
                var links = utils.links(xhr.getResponseHeader('Link'));
                if (links.prev) {
                    o = utils.fromUrl(links.prev);
                    query = o.query;
                    links.prev = {
                        url: links.prev,
                        query: JSON.parse(query.data)
                    }
                }
                if (links.next) {
                    o = utils.fromUrl(links.next);
                    query = o.query;
                    links.next = {
                        url: links.next,
                        query: JSON.parse(query.data)
                    }
                }
                done(null, data, links);
            });
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

exports.remove = function (options, done) {
    $.ajax({
        method: 'DELETE',
        url: utils.resolve('apis:///v/vehicles/' + options.id),
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
        url: utils.resolve('apis:///v/vehicles' + (options.id ? '/' + options.id : '')),
        type: options.id ? 'PUT' : 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(options),
        success: function (data) {
            update([data], options, function (err) {
                if (err) {
                    return done(err);
                }
                done(null, data);
            });
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

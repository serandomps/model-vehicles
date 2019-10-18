var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var form = require('form');
var Vehicles = require('../service');
var Makes = require('vehicle-makes').service;
var Models = require('vehicle-models').service;
var Locations = require('locations').service;

var allProvinces = Locations.allProvinces();

dust.loadSource(dust.compile(require('./template'), 'vehicles-filter'));

var findQuery = function (vform, done) {
    vform.find(function (err, data) {
        if (err) {
            return done(err);
        }
        vform.validate(data, function (err, errors, data) {
            if (err) {
                return done(err);
            }
            if (errors) {
                return vform.update(errors, data, done);
            }
            to(data, function (err, data) {
                if (err) {
                    return done(err);
                }
                done(null, data);
            });
        });
    });
};

var findModels = function (make, done) {
    if (!make) {
        return done(null, []);
    }
    Models.find(make, function (err, models) {
        if (err) {
            return done(err);
        }
        done(null, models);
    });
};

var findDistricts = function (province, done) {
    if (!province) {
        return done(null, Locations.allDistricts());
    }
    return done(null, Locations.districtsByProvince(province));
};

var findCities = function (province, district, done) {
    if (district) {
        return done(null, Locations.citiesByDistrict(district));
    }
    if (province) {
        return done(null, Locations.citiesByProvince(province));
    }
    done(null, Locations.allCities());
};

var to = function (o, done) {
    var query = {
        type: o.type,
        make: o.make,
        model: o.model,
        color: o.color,
        condition: o.condition,
        transmission: o.transmission,
        fuel: o.fuel,
        mileage: o.mileage,
        'price:gte': o['price-gte'],
        'price:lte': o['price-lte'],
        'manufacturedAt:gte': o['manufacturedAt-gte'],
        'manufacturedAt:lte': o['manufacturedAt-lte'],
        'tags:location:province': o['location-province'],
        'tags:location:district': o['location-district'],
        'tags:location:city': o['location-city'],
        'tags:location:postal': o['location-postal']
    };
    var key;
    var value;
    var oo = {};
    for (key in query) {
        if (!query.hasOwnProperty(key)) {
            continue;
        }
        value = query[key];
        if (!value) {
            continue;
        }
        oo[key] = query[key];
    }
    done(null, oo);
};

var from = function (query, done) {
    var o = {
        _: query._,
        type: query.type || '',
        make: query.make || '',
        model: query.model,
        color: query.color,
        condition: query.condition,
        transmission: query.transmission,
        fuel: query.fuel,
        mileage: query.mileage,
        'price-gte': query['price:gte'],
        'price-lte': query['price:lte'],
        'manufacturedAt-gte': query['manufacturedAt:gte'],
        'manufacturedAt-lte': query['manufacturedAt:lte'],
        'location-province': query['tags:location:province'],
        'location-district': query['tags:location:district'],
        'location-city': query['tags:location:city'],
        'location-postal': query['tags:location:postal']
    };
    var key;
    var value;
    var oo = {};
    for (key in o) {
        if (!o.hasOwnProperty(key)) {
            continue;
        }
        value = o[key];
        if (!value) {
            continue;
        }
        oo[key] = o[key];
    }
    done(null, oo);
};

var configs = {
    type: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.type', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    make: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        update: function (context, source, error, value, done) {
            serand.blocks('select', 'update', source, {
                value: value
            }, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.make', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    serand.blocks('select', 'update', $('.model', vform.elem), {
                        value: ''
                    }, function (err) {
                        if (err) {
                            return done(err);
                        }
                        findQuery(vform, function (err, query) {
                            if (err) {
                                return console.error(err);
                            }
                            serand.redirect('/vehicles' + utils.toQuery(query));
                        });
                    });
                }
            }, done);
        }
    },
    model: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.model', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    color: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.color', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    condition: {
        find: function (context, source, done) {
            serand.blocks('radios', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.condition', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    transmission: {
        find: function (context, source, done) {
            serand.blocks('radios', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.transmission', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    fuel: {
        find: function (context, source, done) {
            serand.blocks('radios', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.fuel', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    mileage: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    'price-gte': {
        find: function (context, source, done) {
            serand.blocks('text', 'find', source, function (err, value) {
                if (err) {
                    return done(err);
                }
                done(null, parseInt(value, 10) || null)
            });
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.price-gte', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    'price-lte': {
        find: function (context, source, done) {
            serand.blocks('text', 'find', source, function (err, value) {
                if (err) {
                    return done(err);
                }
                done(null, parseInt(value, 10) || null)
            });
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.price-lte', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    'manufacturedAt-gte': {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt-gte', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    'manufacturedAt-lte': {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt-lte', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.redirect('/vehicles' + utils.toQuery(query));
                    });
                }
            }, done);
        }
    },
    'location-province': {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, function (err, province) {
                if (err) {
                    return done(err);
                }
                done(null, province);
            });
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.location-province', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function (e, clickedIndex, isSelected, previousValue) {
                    if (!isSelected) {
                        return;
                    }
                    serand.blocks('select', 'update', $('.location-district', vform.elem), {
                        value: ''
                    }, function (err) {
                        if (err) {
                            return done(err);
                        }
                        serand.blocks('select', 'update', $('.location-city', vform.elem), {
                            value: ''
                        }, function (err) {
                            if (err) {
                                return done(err);
                            }
                            serand.blocks('select', 'update', $('.location-postal', vform.elem), {
                                value: ''
                            }, function (err) {
                                if (err) {
                                    return done(err);
                                }
                                findQuery(vform, function (err, query) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    serand.redirect('/vehicles' + utils.toQuery(query));
                                });
                            });
                        });
                    });
                }
            }, done);
        }
    },
    'location-district': {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.location-district', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function (e, clickedIndex, isSelected, previousValue) {
                    if (!isSelected) {
                        return;
                    }
                    var source = $('.location-district', vform.elem);
                    serand.blocks('select', 'find', source, function (err, value) {
                        if (err) {
                            return console.error(err);
                        }
                        var province = Locations.provinceByDistrict(value);
                        var provinceSource = $('.location-province', vform.elem);
                        serand.blocks('select', 'update', provinceSource, {
                            value: province
                        }, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            serand.blocks('select', 'update', $('.location-city', vform.elem), {
                                value: ''
                            }, function (err) {
                                if (err) {
                                    return done(err);
                                }
                                serand.blocks('select', 'update', $('.location-postal', vform.elem), {
                                    value: ''
                                }, function (err) {
                                    if (err) {
                                        return done(err);
                                    }
                                    findQuery(vform, function (err, query) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        serand.redirect('/vehicles' + utils.toQuery(query));
                                    });
                                });
                            });
                        });
                    });
                }
            }, done);
        }
    },
    'location-city': {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.location-city', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function (e, clickedIndex, isSelected, previousValue) {
                    if (!isSelected) {
                        return;
                    }
                    var source = $('.location-city', vform.elem);
                    serand.blocks('select', 'find', source, function (err, value) {
                        if (err) {
                            return console.error(err);
                        }
                        var city = Locations.findCity(value);
                        var provinceSource = $('.location-province', vform.elem);
                        serand.blocks('select', 'update', provinceSource, {
                            value: city.province
                        }, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            var districtSource = $('.location-district', vform.elem);
                            serand.blocks('select', 'update', districtSource, {
                                value: city.district
                            }, function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                var postalSource = $('.location-postal', vform.elem);
                                serand.blocks('select', 'update', postalSource, {
                                    value: city.postal
                                }, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    findQuery(vform, function (err, query) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        serand.redirect('/vehicles' + utils.toQuery(query));
                                    });
                                });
                            });
                        });
                    });
                }
            }, done);
        }
    },
    'location-postal': {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.location-postal', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function (e, clickedIndex, isSelected, previousValue) {
                    if (!isSelected) {
                        return;
                    }
                    var source = $('.location-postal', vform.elem);
                    serand.blocks('select', 'find', source, function (err, value) {
                        if (err) {
                            return console.error(err);
                        }
                        var city = Locations.cityByPostal(value);
                        var provinceSource = $('.location-province', vform.elem);
                        serand.blocks('select', 'update', provinceSource, {
                            value: city.province
                        }, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            var districtSource = $('.location-district', vform.elem);
                            serand.blocks('select', 'update', districtSource, {
                                value: city.district
                            }, function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                var citySource = $('.location-city', vform.elem);
                                serand.blocks('select', 'update', citySource, {
                                    value: city.name
                                }, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    findQuery(vform, function (err, query) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        serand.redirect('/vehicles' + utils.toQuery(query));
                                    });
                                });
                            });
                        });
                    });
                }
            }, done);
        }
    }
};

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    options = options || {};

    from(_.cloneDeep(options.query) || {}, function (err, query) {
        if (err) {
            return done(err);
        }
        query._ = query._ || (query._ = {});
        Makes.find(function (err, makes) {
            if (err) {
                return done(err);
            }

            var makeData = [{label: 'Any Make', value: ''}];
            makeData = makeData.concat(_.map(makes, function (make) {
                return {
                    value: make.id,
                    label: make.title
                };
            }));

            findModels(query.make, function (err, models) {
                if (err) {
                    return done(err);
                }

                var modelData = [{label: 'Any Model', value: ''}];
                modelData = modelData.concat(_.map(models, function (model) {
                    return {
                        value: model.id,
                        label: model.title
                    };
                }));

                var manufacturedAt = [];
                var year = moment().year();
                var start = year - 100;
                while (year > start) {
                    manufacturedAt.push({label: year, value: year});
                    year--;
                }

                query._.container = container.id;
                query._.makes = makeData;
                query._.models = modelData;
                query._.types = [{label: 'Any Type', value: ''}].concat(Vehicles.types());
                query._.manufacturedFrom = [{label: 'From Any Year', value: ''}].concat(manufacturedAt);
                query._.manufacturedTo = [{label: 'To Any Year', value: ''}].concat(manufacturedAt);
                query._.conditions = [
                    {label: 'Brand New', value: 'brand-new'},
                    {label: 'Used', value: 'used'},
                    {label: 'Unregistered', value: 'unregistered'}
                ];
                query._.transmissions = [
                    {label: 'Automatic', value: 'automatic'},
                    {label: 'Manual', value: 'manual'},
                    {label: 'Manumatic', value: 'manumatic'}
                ];
                query._.fuels = [
                    {label: 'None', value: 'none'},
                    {label: 'Petrol', value: 'petrol'},
                    {label: 'Diesel', value: 'diesel'},
                    {label: 'Hybrid', value: 'hybrid'},
                    {label: 'Electric', value: 'electric'}
                ];
                query._.colors = [
                    {label: 'Any Color', value: ''},
                    {label: 'Black', value: 'black'},
                    {label: 'Blue', value: 'blue'},
                    {label: 'Brown', value: 'brown'},
                    {label: 'Green', value: 'green'},
                    {label: 'Grey', value: 'grey'},
                    {label: 'Orange', value: 'orange'},
                    {label: 'Red', value: 'red'},
                    {label: 'Silver', value: 'silver'},
                    {label: 'White', value: 'white'},
                    {label: 'Yellow', value: 'yellow'}
                ];
                var provinces = [{label: 'Any Province', value: ''}];
                query._.provinces = provinces.concat(_.map(allProvinces, function (province) {
                    return {
                        label: province,
                        value: province
                    };
                }));
                findDistricts(query['location-province'], function (err, districts) {
                    if (err) {
                        return done(err);
                    }
                    var districtsData = [{label: 'Any District', value: ''}];
                    query._.districts = districtsData.concat(_.map(districts, function (district) {
                        return {
                            label: district,
                            value: district
                        };
                    }));
                    findCities(query['location-province'], query['location-district'], function (err, cities) {
                        if (err) {
                            return done(err);
                        }
                        var citiesData = [{label: 'Any City', value: ''}];
                        var postalsData = [{label: 'Any Postal Code', value: ''}];
                        query._.cities = citiesData.concat(_.map(cities, function (city) {
                            return {
                                label: city.name,
                                value: city.name
                            };
                        }));
                        query._.postals = postalsData.concat(_.sortBy(_.map(cities, function (city) {
                            return {
                                label: city.postal,
                                value: city.postal
                            }
                        }), 'value'));

                        dust.render('vehicles-filter', serand.pack(query, container), function (err, out) {
                            if (err) {
                                return done(err);
                            }

                            var elem = sandbox.append(out);
                            var vform = form.create(container.id, elem, configs);

                            vform.render(ctx, query, function (err) {
                                if (err) {
                                    return done(err);
                                }
                                done(null, function () {
                                    $('.vehicles-filter', sandbox).remove();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

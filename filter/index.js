var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var form = require('form');
var Make = require('vehicle-makes').service;
var Model = require('vehicle-models').service;

dust.loadSource(dust.compile(require('./template'), 'vehicles-filter'));

var from = function (o) {
    var oo = {};
    Object.keys(o).forEach(function (name) {
        oo[name.replace(/:/g, '-')] = o[name];
    });
    return oo;
};

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
            done(null, data);
        });
    });
};

var findModels = function (make, done) {
    if (!make) {
        return done(null, []);
    }
    Model.find(make, function (err, models) {
        if (err) {
            return done(err);
        }
        done(null, models);
    });
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
    }
};

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    options = options || {};
    Make.find(function (err, makes) {
        if (err) {
            return done(err);
        }

        var makeData = [{label: 'All Makes', value: ''}];
        makeData = makeData.concat(_.map(makes, function (make) {
            return {
                value: make.id,
                label: make.title
            };
        }));

        var query = _.cloneDeep(options.query) || {};

        findModels(query.make, function (err, models) {
            if (err) {
                return done(err);
            }

            var modelData = [{label: 'All Models', value: ''}];
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

            query._ = {
                container: container.id
            };
            query._.makes = makeData;
            query._.models = modelData;
            query._.types = [
                {label: 'All Types', value: ''},
                {label: 'SUV', value: 'suv'},
                {label: 'Car', value: 'car'},
                {label: 'Cab', value: 'cab'},
                {label: 'Bus', value: 'bus'},
                {label: 'Lorry', value: 'lorry'},
                {label: 'Backhoe', value: 'backhoe'},
                {label: 'Motorcycle', value: 'motorcycle'},
                {label: 'Threewheeler', value: 'threewheeler'},
            ];
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
                {label: 'All Colors', value: ''},
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

            dust.render('vehicles-filter', serand.pack(query, container), function (err, out) {
                if (err) {
                    return done(err);
                }

                var elem = sandbox.append(out);
                var vform = form.create(container.id, elem, configs);
                vform.render(ctx, from(query), function (err) {
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
};

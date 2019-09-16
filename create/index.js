var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var form = require('form');
var locations = require('locations');
var contacts = require('contacts');
var Vehicle = require('../service');
var Make = require('vehicle-makes').service;
var Model = require('vehicle-models').service;

dust.loadSource(dust.compile(require('./template'), 'vehicles-create'));

var resolution = '288x162';

var vehicleConfigs = {
    type: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the type of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.type', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value
            }, done);
        }
    },
    manufacturedAt: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the year of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value ? moment(value).year() : ''
            }, done);
        }
    },
    doors: {
        find: function (context, source, done) {
            done(null, 5);
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    seats: {
        find: function (context, source, done) {
            done(null, 5);
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    engine: {
        find: function (context, source, done) {
            done(null, 1500);
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    driveType: {
        find: function (context, source, done) {
            done(null, 'front');
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    steering: {
        find: function (context, source, done) {
            done(null, 'right');
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    make: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the make of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.make', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    var thiz = $(this);
                    updateModels(vform.contexts.model, vform.elem, thiz.val(), null, function (err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            }, done);
        }
    },
    model: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the model of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.model', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value
            }, done);
        }
    },
    condition: {
        find: function (context, source, done) {
            done(null, $('input:checked', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the condition of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.condition', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value
            }, done);
        }
    },
    transmission: {
        find: function (context, source, done) {
            done(null, $('input:checked', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the transmission of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.transmission', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value
            }, done);
        }
    },
    fuel: {
        find: function (context, source, done) {
            done(null, $('input:checked', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select the fuel of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.fuel', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value
            }, done);
        }
    },
    color: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please enter the color of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.color', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value
            }, done);
        }
    },
    mileage: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please enter the mileage of your vehicle');
            }
            value = Number(value);
            if (!is.number(value)) {
                return done(null, 'Please enter a valid number for the mileage of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    price: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please enter the price of your vehicle');
            }
            value = Number(value);
            if (!is.number(value)) {
                return done(null, 'Please enter a valid amount for the price of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    currency: {
        find: function (context, source, done) {
            done(null, 'LKR');
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        }
    },
    description: {
        find: function (context, source, done) {
            done(null, $('textarea', source).val());
        },
        validate: function (context, data, value, done) {
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.description', vform.elem);
            serand.blocks('textarea', 'create', el, {
                value: value
            }, done);
        }
    },
    images: {
        find: function (context, source, done) {
            serand.blocks('uploads', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please upload images of your vehicle');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.images', vform.elem);
            serand.blocks('uploads', 'create', el, {
                value: value
            }, done);
        }
    },
};

var create = function (data, done) {
    utils.loading();
    var end = function (err, data) {
        utils.loaded();
        done(err, data);
    };
    Vehicle.create(data, function (err, data) {
        if (err) {
            return end(err);
        }
        end(null, data);
    });
};

var remove = function (id, done) {
    Vehicle.remove({id: id}, done);
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

var updateModels = function (ctx, elem, make, model, done) {
    var source = $('.model', elem);
    findModels(make, function (err, models) {
        if (err) {
            return done(err);
        }
        var modelz = _.map(models, function (model) {
            return {label: model.title, value: model.id};
        });
        serand.blocks('select', 'update', source, {
            options: modelz
        }, done);
    });
};

var stepHandler = function (handler, done) {
    handler.find(function (err, o) {
        if (err) {
            return done(err);
        }
        handler.validate(o, function (err, errors, o) {
            if (err) {
                return done(err);
            }
            handler.update(errors, o, function (err) {
                if (err) {
                    return done(err);
                }
                if (errors) {
                    return done(null, errors);
                }
                done(null, null, o);
            });
        });
    });
};

var createHandler = function (handler, done) {
    stepHandler(handler, function (err, errors, o) {
        if (err) {
            return done(err);
        }
        if (errors) {
            return done(null, errors);
        }
        handler.create(o, done);
    })
};

var render = function (ctx, container, data, done) {
    var id = data.id;
    var sandbox = container.sandbox;
    Make.find(function (err, makes) {
        if (err) {
            return done(err);
        }
        var makeData = _.map(makes, function (make) {
            return {
                value: make.id,
                label: make.title
            };
        });
        findModels(data.make, function (err, models) {
            if (err) {
                return done(err);
            }

            var modelData = _.map(models, function (model) {
                return {
                    value: model.id,
                    label: model.title
                };
            });

            var manufacturedAt = [];
            var year = moment().year();
            var start = year - 100;
            while (year > start) {
                manufacturedAt.push({label: year, value: year});
                year--;
            }

            data._ = data._ || {};
            data._.makes = makeData;
            data._.models = modelData;
            data._.types = [
                {label: 'SUV', value: 'suv'},
                {label: 'Car', value: 'car'},
                {label: 'Cab', value: 'cab'},
                {label: 'Bus', value: 'bus'},
                {label: 'Lorry', value: 'lorry'},
                {label: 'Backhoe', value: 'backhoe'},
                {label: 'Motorcycle', value: 'motorcycle'},
                {label: 'Threewheeler', value: 'threewheeler'},
            ];
            data._.manufacturedAt = manufacturedAt;
            data._.conditions = [
                {label: 'Brand New', value: 'brand-new'},
                {label: 'Used', value: 'used'},
                {label: 'Unregistered', value: 'unregistered'}
            ];
            data._.transmissions = [
                {label: 'Automatic', value: 'automatic'},
                {label: 'Manual', value: 'manual'},
                {label: 'Manumatic', value: 'manumatic'}
            ];
            data._.fuels = [
                {label: 'Petrol', value: 'petrol'},
                {label: 'Diesel', value: 'diesel'},
                {label: 'Hybrid', value: 'hybrid'},
                {label: 'Electric', value: 'electric'},
                {label: 'None', value: 'none'}
            ];
            data._.contacts = [
                {label: 'You', value: 'you'},
                {label: 'Other', value: 'other'}
            ];
            data._.color = [
                {label: 'Black', value: 'black'},
                {label: 'Blue', value: 'blue'},
                {label: 'Brown', value: 'brown'},
                {label: 'Green', value: 'green'},
                {label: 'Orange', value: 'orange'},
                {label: 'Red', value: 'red'},
                {label: 'Silver', value: 'silver'},
                {label: 'White', value: 'white'},
                {label: 'Yellow', value: 'yellow'}
            ];
            data._.back = '/vehicles' + (id ? '/' + id : '');
            dust.render('vehicles-create', data, function (err, out) {
                if (err) {
                    return done(err);
                }
                var elem = sandbox.append(out);
                var handlers = {};
                var vehicleForm = form.create(container.id, $('.tab-pane[data-name="vehicle"] .step', elem), vehicleConfigs);
                handlers.vehicle = vehicleForm;
                vehicleForm.render(ctx, data, function (err) {
                    if (err) {
                        return done(err);
                    }
                    locations.picker(ctx, {
                        id: container.id,
                        sandbox: $('.tab-pane[data-name="location"] .step', elem)
                    }, {
                        required: true,
                        label: 'Location',
                        location: data.location
                    }, function (err, o) {
                        if (err) {
                            return done(err);
                        }
                        handlers.location = o;

                        contacts.picker(ctx, {
                            id: container.id,
                            sandbox: $('.tab-pane[data-name="contact"] .step', elem)
                        }, {
                            required: true,
                            label: 'Contacts',
                            contact: data.contact
                        }, function (err, o) {
                            if (err) {
                                return done(err);
                            }
                            handlers.contact = o;

                            serand.blocks('steps', 'create', elem, {
                                step: function (from, done) {
                                    stepHandler(handlers[from], done);
                                },
                                create: function (elem) {
                                    createHandler(handlers.vehicle, function (err, errors, vehicle) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        if (errors) {
                                            return;
                                        }
                                        vehicle.id = vehicle.id || id;
                                        createHandler(handlers.location, function (err, errors, location) {
                                            if (err) {
                                                return console.error(err);
                                            }
                                            if (errors) {
                                                return;
                                            }
                                            vehicle.location = location;
                                            createHandler(handlers.contact, function (err, errors, contact) {
                                                if (err) {
                                                    return console.error(err);
                                                }
                                                if (errors) {
                                                    return;
                                                }
                                                vehicle.contact = contact;
                                                create(vehicle, function (err) {
                                                    if (err) {
                                                        return console.error(err);
                                                    }
                                                    serand.redirect('/mine');
                                                });
                                            });
                                        });
                                    });
                                }
                            }, function (err) {
                                if (err) {
                                    return done(err);
                                }
                                $('.delete', elem).click(function (e) {
                                    e.stopPropagation();
                                    remove(id, function (err) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        console.log('data deleted successfully');
                                    });
                                    return false;
                                });
                                done(null, function () {
                                    $('.vehicles-create', sandbox).remove();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports = function (ctx, container, options, done) {
    options = options || {};
    var id = options.id;
    if (!id) {
        render(ctx, container, serand.pack({}, container), done);
        return;
    }
    Vehicle.findOne({
        id: id,
        resolution: resolution
    }, function (err, vehicle) {
        if (err) {
            return done(err);
        }
        render(ctx, container, serand.pack(vehicle, container), done);
    });
};

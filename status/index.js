var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var form = require('form');
var Contacts = require('contacts').service;
var Locations = require('locations').service;
var Vehicle = require('../service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-status'));

var configs = {
    status: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        validate: function (context, data, value, done) {
            if (!value) {
                return done(null, 'Please select a status');
            }
            done(null, null, value);
        },
        update: function (context, source, error, value, done) {
            done();
        },
        render: function (ctx, statusForm, data, value, done) {
            var el = $('.status', statusForm.elem);
            serand.blocks('select', 'create', el, {
                value: data._.status
            }, done);
        }
    },
};

var findStatus = function (vehicle, done) {
    var groups = utils.groups();
    var permissions = vehicle.permissions;
    var permsByGroup = _.keyBy(_.filter(permissions, 'group'), 'group');
    var permPub = permsByGroup[groups.public.id];
    if (!permPub) {
        return done(null, 'unpublished');
    }
    if (permPub.actions.indexOf('read') === -1) {
        return done(null, 'unpublished');
    }
    return done(null, 'published');
};

var unpublish = function (vehicle, done) {
    Contacts.findOne({id: vehicle.contact}, function (err, contact) {
        if (err) {
            return done(err);
        }
        utils.unpublish(contact, function (err, contact) {
            if (err) {
                return done(err);
            }
            Contacts.create(contact, function (err) {
                if (err) {
                    return done(err);
                }
                Locations.findOne({id: vehicle.location}, function (err, location) {
                    if (err) {
                        return done(err);
                    }
                    utils.unpublish(location, function (err, location) {
                        if (err) {
                            return done(err);
                        }
                        Locations.create(location, function (err) {
                            if (err) {
                                return done(err);
                            }
                            utils.unpublish(vehicle, function (err, vehicle) {
                                if (err) {
                                    return done(err);
                                }
                                Vehicle.create(vehicle, done);
                            });
                        });
                    });
                });
            });
        });
    });
};

var publish = function (vehicle, done) {
    Contacts.findOne({id: vehicle.contact}, function (err, contact) {
        if (err) {
            return done(err);
        }
        utils.publish(contact, function (err, contact) {
            if (err) {
                return done(err);
            }
            Contacts.create(contact, function (err) {
                if (err) {
                    return done(err);
                }
                Locations.findOne({id: vehicle.location}, function (err, location) {
                    if (err) {
                        return done(err);
                    }
                    utils.publish(location, function (err, location) {
                        if (err) {
                            return done(err);
                        }
                        Locations.create(location, function (err) {
                            if (err) {
                                return done(err);
                            }
                            utils.publish(vehicle, function (err, vehicle) {
                                if (err) {
                                    return done(err);
                                }
                                Vehicle.create(vehicle, done);
                            });
                        });
                    });
                });
            });
        });
    });
};

var updateStatus = function (vehicle, status, done) {
    findStatus(vehicle, function (err, old) {
        if (err) {
            return done(err);
        }
        if (old === status) {
            return done();
        }
        if (status === 'unpublished') {
            return unpublish(vehicle, done);
        }
        publish(vehicle, done);
    });
};

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicle.findOne({id: options.id}, function (err, vehicle) {
        if (err) return done(err);
        vehicle._.picks = [
            {label: 'Published', value: 'published'},
            {label: 'Unpublished', value: 'unpublished'}
        ];
        findStatus(vehicle, function (err, status) {
            if (err) {
                return done(err);
            }
            vehicle._.status = status;
            vehicle = serand.pack(vehicle, container);
            dust.render('vehicles-status', vehicle, function (err, out) {
                if (err) {
                    return done(err);
                }
                var elem = sandbox.append(out);
                var statusForm = form.create(container.id, elem, configs);
                ctx.form = statusForm;
                statusForm.render(ctx, vehicle, function (err) {
                    if (err) {
                        return done(err);
                    }
                    sandbox.on('click', '.update', function (e) {
                        statusForm.find(function (err, data) {
                            if (err) {
                                return done(err);
                            }
                            statusForm.validate(data, function (err, errors, data) {
                                if (err) {
                                    return done(err);
                                }
                                statusForm.update(errors, data, function (err) {
                                    if (err) {
                                        return done(err);
                                    }
                                    if (errors) {
                                        return done();
                                    }
                                    updateStatus(vehicle, data.status, function (err) {
                                        if (err) {
                                            return done(err);
                                        }
                                        serand.redirect('/vehicles/' + vehicle.id);
                                    });
                                });
                            });
                        });
                    });
                    sandbox.on('click', '.cancel', function (e) {
                        serand.redirect('/vehicles/' + vehicle.id);
                    });
                    done(null, serand.none);
                });
            });
        });
    });
};

var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var form = require('form');
var Contacts = require('contacts').service;
var Locations = require('locations').service;
var Vehicle = require('../service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-review'));
dust.loadSource(dust.compile(require('./details'), 'vehicles-review-details'));

/*
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
*/

var findLocation = function (id, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/locations/' + id),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
};

var findContact = function (id, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/contacts/' + id),
        dataType: 'json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err || status || xhr);
        }
    });
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

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicle.findOne({id: options.id, resolution: '800x450'}, function (err, vehicle) {
        if (err) return done(err);
        async.parallel({
            location: function (found) {
                findLocation(vehicle.location, function (err, location) {
                    if (err) {
                        console.error(err);
                    }
                    found(null, location);
                });
            },
            contact: function (found) {
                findContact(vehicle.contact, function (err, contact) {
                    if (err) {
                        console.error(err);
                    }
                    found(null, contact);
                })
            }
        }, function (err, o) {
            if (err) {
                return done(err);
            }
            vehicle._.contact = o.contact;
            vehicle._.contactOK = o.contact && o.contact.status === 'published';
            vehicle._.location = o.location;
            vehicle._.locationOK = o.location && o.location.status === 'published';
            vehicle._.vehicleOK = (vehicle.status === 'published' || (vehicle._.locationOK && vehicle._.contactOK));
            /*vehicle._.picks = [
                {label: 'Published', value: 'published'},
                {label: 'Unpublished', value: 'unpublished'}
            ];*/
            vehicle = serand.pack(vehicle, container);
            dust.render('vehicles-review', vehicle, function (err, out) {
                if (err) {
                    return done(err);
                }

                sandbox.append(out);

                $('.location-ok', sandbox).on('click', function () {
                    var thiz = $(this);
                    utils.loading();
                    utils.publish('accounts', 'locations', o.location, function (err) {
                        utils.loaded();
                        if (err) {
                            return console.error(err);
                        }
                        o.location.status = 'published';
                        thiz.removeClass('text-primary').addClass('text-success')
                            .siblings('.location-bad').addClass('hidden');
                        if (o.contact.status === 'published') {
                            $('.vehicle-ok', sandbox).removeClass('disabled');
                        }
                    });
                });

                $('.contact-ok', sandbox).on('click', function () {
                    var thiz = $(this);
                    utils.loading();
                    utils.publish('accounts', 'contacts', o.contact, function (err) {
                        utils.loaded();
                        if (err) {
                            return console.error(err);
                        }
                        o.contact.status = 'published';
                        thiz.removeClass('text-primary').addClass('text-success')
                            .siblings('.contact-bad').addClass('hidden');
                        if (o.location.status === 'published') {
                            $('.vehicle-ok', sandbox).removeClass('disabled');
                        }
                    });
                });

                $('.vehicle-ok', sandbox).on('click', function () {
                    var thiz = $(this);
                    utils.loading();
                    utils.publish('autos', 'vehicles', vehicle, function (err) {
                        utils.loaded();
                        if (err) {
                            return console.error(err);
                        }
                        thiz.removeClass('text-primary').addClass('text-success')
                            .siblings('.vehicle-bad').addClass('hidden');

                        setTimeout(function () {
                            serand.redirect('/vehicles');
                        }, 500);
                    });
                });

                done(null, {
                    clean: function () {
                        $('.vehicles-review', sandbox).remove();
                    },
                    ready: function () {
                        var i;
                        var o = [];
                        var images = vehicle._.images;
                        var length = images.length;
                        var image;
                        for (i = 0; i < length; i++) {
                            image = images[i];
                            o.push({
                                href: image.url,
                                thumbnail: image.url
                            });
                        }
                        blueimp.Gallery(o, {
                            container: $('.blueimp-gallery-carousel', sandbox),
                            carousel: true,
                            thumbnailIndicators: true,
                            stretchImages: true
                        });
                    }
                });
                /*var statusForm = form.create(container.id, elem, configs);
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
                    done(null, {
                        clean: function () {
                            $('.vehicles-status', sandbox).remove();
                        },
                        ready: function () {
                            var i;
                            var o = [];
                            var images = vehicle._.images;
                            var length = images.length;
                            var image;
                            for (i = 0; i < length; i++) {
                                image = images[i];
                                o.push({
                                    href: image.url,
                                    thumbnail: image.url
                                });
                            }
                            blueimp.Gallery(o, {
                                container: $('.blueimp-gallery-carousel', sandbox),
                                carousel: true,
                                thumbnailIndicators: true,
                                stretchImages: true
                            });
                        }
                    });
                });*/
            });
        });
    });
};

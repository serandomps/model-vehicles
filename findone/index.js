var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Vehicle = require('../service');

require('gallery');

var token;

dust.loadSource(dust.compile(require('./template'), 'vehicles-findone'));
dust.loadSource(dust.compile(require('./buttons'), 'vehicles-findone-buttons'));

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

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    Vehicle.findOne({id: options.id, resolution: '800x450'}, function (err, vehicle) {
        if (err) {
            return done(err);
        }
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
            vehicle._.location = o.location;
            if (token && token.user.id === vehicle.user) {
                vehicle._.edit = true;
            }
            dust.render('vehicles-findone', vehicle, function (err, out) {
                if (err) {
                    return done(err);
                }
                sandbox.append(out);
                done(null, {
                    clean: function () {
                        $('.vehicles-findone', sandbox).remove();
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
            });
        });
    });
};

serand.on('user', 'ready', function (tk) {
    token = tk;
});

serand.on('user', 'logged in', function (tk) {
    token = tk;
});

serand.on('user', 'logged out', function (tk) {
    token = null;
});

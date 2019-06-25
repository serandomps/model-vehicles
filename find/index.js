var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');

dust.loadSource(dust.compile(require('./template'), 'vehicles-find'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    dust.render('vehicles-find', serand.pack(options, container), function (err, out) {
        if (err) {
            return done(err);
        }
        sandbox.append(out);
        sandbox.on('click', '.edit', function (e) {
            serand.redirect($(this).closest('.thumbnail').attr('href') + '/edit');
            return false;
        });
        done(null, function () {
            $('.vehicles-find', sandbox).remove();
        });
    });
};

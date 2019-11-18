var list = require('../find');

module.exports = function (ctx, container, options, done) {
    list(ctx, container, {
        title: 'Featured',
        query: options.query,
        secondary: true,
        size: options.size || 4
    }, done);
};

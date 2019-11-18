var list = require('../find');

module.exports = function (ctx, container, options, done) {
    options = options || {}
    options.user = ctx.token && ctx.token.user.id
    list(ctx, container, {
        query: options,
        title: 'My Vehicles',
        size: 3
    }, done);
};

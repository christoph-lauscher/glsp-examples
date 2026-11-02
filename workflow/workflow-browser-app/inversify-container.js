const inversify = require('inversify');

class Container extends inversify.Container {
    constructor(options = {}) {
        super({ ...options, skipBaseClassChecks: true });
    }
}

module.exports = { ...inversify, Container };

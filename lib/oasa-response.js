let oasa_content = require('./oasa-content.js').oasa_content;


class oasa_response {
    constructor (spec, oasd, status) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
             throw new Error('no schema OpenAPI specification (second parameter)');
        if (!status)
            throw new Error('no status (third parameter)');

        this._status = Number(status);
        this._spec = spec;
        this._oasd = oasd;
    }

    status () {
        return this._status;
    }

    descr () {
        return this._oasd.description;
    }

    content () {
        return this._oasd.content
            ? new oasa_content(this._spec, this._oasd.content)
            : undefined;
    }

    success () {
        return this._status >= 200 && this._status <= 299;
    }

    failure () {
        return this._status >= 400 && this._status <= 599;
    }

    redirection () {
        return this._status >= 300 && this._status <= 399;
    }
}


module.exports = {
    'oasa_response': oasa_response,
};

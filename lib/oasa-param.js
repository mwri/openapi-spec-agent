const oasa_schema = require('./../lib/oasa-schema.js').oasa_schema;


class oasa_param {
    constructor(spec, oasd) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no schema OpenAPI specification (second parameter)');

        this._spec = spec;
        this._oasd = oasd;
    }

    name () {
        return this._oasd.name;
    }

    in () {
        return this._oasd.in;
    }

    descr () {
        return this._oasd.description;
    }

    required () {
        return this._oasd.required !== undefined
            ? this._oasd.required
            : this._oasd.in === 'path'
            ? true
            : false;
    }

    schema () {
        return new oasa_schema(this._spec, this._oasd.schema);
    }
}


module.exports = {
    'oasa_param': oasa_param,
};

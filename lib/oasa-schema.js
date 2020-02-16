const oasa_object = require('./oasa-object.js').oasa_object;


class oasa_schema {
    constructor (spec, oasd, name) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no schema OpenAPI specification (second parameter)');

        if (!oasd.type)
            throw new Error('no type in schema OpenAPI specification');
        if (oasd.type !== 'object' && oasd.type !== 'array' && oasd.type !== 'string')
            throw new Error('type must be object or array');

        if (!oasd.required)
            oasd.required = [];
        if (!oasd.properties)
            oasd.properties = {};

        this._spec = spec;
        this._oasd = oasd;
        this._name = name;
    }

    name () {
        return this._name;
    }

    type () {
        return this._oasd.type;
    }

    all_props () {
        return Object.keys(this._oasd.properties)
            .map((pn) => new oasa_property(this._spec, this._oasd.properties[pn], pn, this._oasd.properties[pn]));
    }

    required_props () {
        return Object.keys(this._oasd.properties)
            .filter((pn) => this._oasd.required.includes(pn))
            .map((pn) => new oasa_property(this._spec, this._oasd.properties[pn], pn));
    }

    optional_props () {
        return Object.keys(this._oasd.properties)
            .filter((pn) => !this._oasd.required.includes(pn))
            .map((pn) => new oasa_property(this._spec, this._oasd.properties[pn], pn));
    }

    named_prop (pn) {
        return this._oasd.properties[pn]
            ? new oasa_property(this._spec, this._oasd.properties[pn], pn)
            : undefined;
    }

    of () {
        if (this._oasd.type !== 'array')
            throw new Error('cannot call of on non array schema');
        if (!this._oasd.items)
            throw new Error('of() call on schema array without items not supported');

        if (this._oasd.items.$ref)
            return this._spec.resolve_ref(this._oasd.items.$ref);
        else
            return new oasa_schema(this._spec, this._oasd.items);
    }

    interpret (data) {
        if (this.type() === 'object') {
            return new oasa_object(this._spec, data, this);
        } else if (this.type() === 'array') {
            return data.map((data) => new oasa_object(this._spec, data, this.of()));
        }
    }
}


class oasa_property {
    constructor (spec, oasd, name) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no property OpenAPI specification (second parameter)');
        if (!name)
            throw new Error('no name (third parameter)');

        this._spec = spec;
        this._name = name;
        this._oasd = oasd;
    }

    name () {
        return this._name;
    }

    type () {
        return this._oasd.type;
    }

    descr () {
        return this._oasd.description;
    }

    enum () {
        return this._oasd.enum;
    }

    example () {
        return this._oasd.example;
    }

    schema () {
        return new oasa_schema(this._spec, this._oasd);
    }
}


module.exports = {
    'oasa_schema':   oasa_schema,
    'oasa_property': oasa_property,
};

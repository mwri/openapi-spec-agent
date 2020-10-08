const oasa_object = require('./oasa-object.js').oasa_object;


let allowed_types = ['object', 'array', 'string', 'boolean', 'number', 'integer'];


class oasa_schema {
    constructor (spec, oasd, name, ctx) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no schema OpenAPI specification (second parameter)');

        if (oasd.type && !allowed_types.includes(oasd.type))
            throw new Error(`type must be valid (${allowed_types.join(', ')})`);

        if (!oasd.required)
            oasd.required = [];
        if (!oasd.properties)
            oasd.properties = {};

        this._spec = spec;
        this._oasd = oasd;
        this._name = name;
        this._type = oasd.type || 'any';
        this._ctx  = ctx || (name ? [`schema:${name}`] : ['schema']);
    }

    name () {
        return this._name;
    }

    type () {
        return this._type;
    }

    all_props () {
        return Object.keys(this._oasd.properties)
            .map((pn) => new oasa_property(this._spec, this._oasd.properties[pn], pn, this._ctx.concat(`prop:${pn}`)));
    }

    required_props () {
        return Object.keys(this._oasd.properties)
            .filter((pn) => this._oasd.required.includes(pn))
            .map((pn) => new oasa_property(this._spec, this._oasd.properties[pn], pn, this._ctx.concat(`prop:${pn}`)));
    }

    optional_props () {
        return Object.keys(this._oasd.properties)
            .filter((pn) => !this._oasd.required.includes(pn))
            .map((pn) => new oasa_property(this._spec, this._oasd.properties[pn], pn, this._ctx.concat(`prop:${pn}`)));
    }

    named_prop (pn) {
        return this._oasd.properties[pn]
            ? new oasa_property(this._spec, this._oasd.properties[pn], pn, this._ctx.concat(`prop:${pn}`))
            : undefined;
    }

    of () {
        if (this._type !== 'array')
            throw new Error('cannot call of on non array schema');
        if (!this._oasd.items)
            throw new Error('of() call on schema array without items not supported');

        if (this._oasd.items.$ref)
            return this._spec.resolve_ref(this._oasd.items.$ref);
        else
            return new oasa_schema(this._spec, this._oasd.items, undefined, this._ctx.slice(0, this._ctx.length-1).concat(this._ctx[this._ctx.length-1]+'[]'));
    }

    interpret (data) {
        if (data === null) {
            return null;
        } else if (this._type === 'object') {
            return new oasa_object(this._spec, data, this);
        } else if (this._type === 'array') {
            if (data instanceof Array)
                return data.map((data) => this.of().interpret(data));
            else if (data !== undefined && data !== null)
                this._spec._logger('warn', `schema [path ${this.path()}] is array but data is not, ignoring data`);
        } else if (this._type === 'string' || this._type === 'number' || this._type === 'integer' || this._type === 'boolean' || this._type === 'any') {
            return data;
        }
    }

    path () {
        return this._ctx.length > 0
            ? `/${this._ctx.join('/')}`
            : '/';
    }
}


class oasa_property {
    constructor (spec, oasd, name, ctx) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no property OpenAPI specification (second parameter)');
        if (!name)
            throw new Error('no name (third parameter)');

        this._spec = spec;
        this._name = name;
        this._ctx  = ctx || [];this._oasd = oasd;

        if (oasd.$ref) {
            this._schema = spec.resolve_ref(oasd.$ref);
            this._oasd = this._schema._oasd;
        } else {
            this._schema = new oasa_schema(spec, oasd, undefined, this._ctx);
            this._oasd = oasd;
        }
    }

    name () {
        return this._name;
    }

    type () {
        return this._oasd.type || 'any';
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

    read_only () {
        return this._oasd.readOnly || false;
    }

    schema () {
        return this._schema;
    }
}


module.exports = {
    'oasa_schema':   oasa_schema,
    'oasa_property': oasa_property,
};

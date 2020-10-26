class oasa_object {
    constructor (spec, data, schema) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!data)
            throw new Error('no data (second parameter)');
        if (!schema)
            throw new Error('no schema (third parameter)');

        this._spec   = spec;
        this._schema = schema;
        this._props  = {};

        for (const prop_name of Object.keys(data)) {
            let prop = this._schema.named_prop(prop_name);

            if (prop)
                this._props[prop_name] = prop.schema().interpret(data[prop_name]);
            else
                this._spec._logger('warn', `object data includes property "${prop_name}" which is not included in schema [path ${this._schema.path()}]`);
        }
    }

    prop (name) {
        return this._props[name];
    }

    schema () {
        return this._schema;
    }

    serialise () {
        function serialise_non_obj (val, type) {
            if (type == 'array')
                return val.map((v) => v instanceof oasa_object ? v.serialise() : serialise_non_obj(v));
            else
                return val;
        }

        return this.schema().all_props().reduce((acc, prop) => {
            let prop_type = prop.type();
            let prop_name = prop.name();
            let prop_val  = this.prop(prop_name);

            if (prop_val)
                acc[prop_name] = prop_val instanceof oasa_object
                    ? prop_val.serialise()
                    : serialise_non_obj(prop_val, prop_type);

            return acc;
        }, {});
    }
}


module.exports = {
    'oasa_object': oasa_object,
};

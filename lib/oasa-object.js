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
}


module.exports = {
    'oasa_object': oasa_object,
};

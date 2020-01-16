class oasa_object {
    constructor (spec, data, schema) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!data)
            throw new Error('no data (second parameter)');
        if (!schema)
            throw new Error('no schema (third parameter)');

        this._schema = schema;
        this._props = {};

        for (const prop of schema.all_props()) {
            let prop_name = prop.name();
            if (prop.type() === 'string') {
                if (prop_name in data)
                    this._props[prop_name] = data[prop_name];
            } else if (prop.type() === 'object') {
                if (prop_name in data)
                    this._props[prop_name] = new oasa_object(spec, data[prop_name], prop.schema());
            }
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

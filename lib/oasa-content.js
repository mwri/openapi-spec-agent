const oasa_schema  = require('./oasa-schema.js').oasa_schema;


class oasa_content {
    constructor (spec, oasd) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no content OpenAPI specification (second parameter)');

        if (Object.keys(oasd).length === 0)
            throw new Error('content is empty, expected content type');

        this._spec = spec;
        this._oasd = oasd;
    }

    content_types () {
        return Object.keys(this._oasd);
    }

    schema (content_type) {
        if (!content_type)
            throw new Error('no content type (first parameter)');

        let ct_oasd = this._oasd[content_type];

        if (!ct_oasd)
            return undefined;

        return ct_oasd.schema.$ref
            ? this._spec.resolve_ref(this._oasd[content_type].schema.$ref)
            : new oasa_schema(this._spec, ct_oasd.schema);
    }
}


module.exports = {
    'oasa_content': oasa_content,
};

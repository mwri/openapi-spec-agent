const oasa_content = require('./oasa-content.js').oasa_content;


class oasa_reqbody {
    constructor (spec, oasd) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no reqbody OpenAPI specification (first parameter)');

        this._content = new oasa_content(spec, oasd.content);
    }

    content_types () {
        return this._content.content_types();
    }

    schema (content_type) {
        return this._content.schema(content_type);
    }
}


module.exports = {
    'oasa_reqbody': oasa_reqbody,
};

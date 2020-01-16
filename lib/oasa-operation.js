const oasa_response  = require('./oasa-response.js').oasa_response;
const oasa_secscheme = require('./oasa-secscheme.js').oasa_secscheme;
const oasa_reqbody   = require('./oasa-reqbody.js').oasa_reqbody;
const oasa_param     = require('./oasa-param.js').oasa_param;


class oasa_operation {
    constructor(spec, oasd, path, method) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no schema OpenAPI specification (second parameter)');
        if (!path)
            throw new Error('no path (third parameter)');
        if (!method)
            throw new Error('no method (fourth parameter)');

        if (!oasd.responses)
            oasd.responses = {};

        this._spec   = spec;
        this._path   = path;
        this._method = method;
        this._oasd   = oasd;
    }

    path() {
        return this._path.charAt(0) === '/'
            ? this._path.slice(1)
            : this._path;
    }

    method() {
        return this._method.toUpperCase();
    }

    id () {
        return this._oasd.operationId;
    }

    summary () {
        return this._oasd.summary;
    }

    tags() {
        return this._oasd.tags || [];
    }

    responses() {
        return Object.keys(this._oasd.responses).map((status) => new oasa_response(this._spec, this._oasd.responses[status], status));
    }

    security() {
        if (!this._oasd.security)
            return [];

        return this._oasd.security.map((res_ss) => {
            let name = Object.keys(res_ss)[0];
            return new oasa_secscheme(this._spec, this._spec.resolve_ref(`#/components/securitySchemes/${name}`), name, res_ss[name]);
        });
    }

    req_body() {
        if (!this._oasd.requestBody)
            return undefined;

        return this._oasd.requestBody.$ref
            ? this._spec.resolve_ref(this._oasd.requestBody.$ref)
            : new oasa_reqbody(this._spec, this._oasd.requestBody);
    }

    params () {
        return this._oasd.parameters !== undefined
            ? this._oasd.parameters.map((p_oasd) => new oasa_param(this._spec, p_oasd))
            : [];
    }

    request (server, param_vals, content_type, body) {
        if (param_vals === undefined)
            param_vals = {};

        let url = server;
        if (url.charAt(url.length - 1) === '/')
            url = url.substr(0, url.length - 1);
        let path = this._path;
        if (path.charAt(path) === '/')
            path = path.substr(1);

        url = url + '/' + path;

        let query_params = [];
        let params = this.params();
        for (const param of params) {
            let param_val = param_vals[param.name()];
            if (param_val) {
                if (param.in() === 'query')
                    query_params.push(`${param.name()}=${encodeURIComponent(param_val)}`);
                else if (param.in() === 'path')
                    url = url.replace(`{${param.name()}}`, encodeURIComponent(param_val));
            }
        }
        if (query_params.length > 0)
            url += '?' + query_params.join('&');

        let encoded_body = undefined;
        if (content_type !== undefined && body !== undefined) {
            if (content_type === 'application/json')
                encoded_body = JSON.stringify(body);
            else if (content_type === 'plain/text')
                encoded_body = body;
            else if (content_type === 'application/octet-stream')
                encoded_body = body;
        }

        return {
            'method':       this.method(),
            'url':          url,
            'body':         encoded_body,
            'content_type': content_type,
        };
    }
}


module.exports = {
    'oasa_operation': oasa_operation,
};

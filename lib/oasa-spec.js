const oasa_schema    = require('./oasa-schema.js').oasa_schema;
const oasa_reqbody   = require('./oasa-reqbody.js').oasa_reqbody;
const oasa_secscheme = require('./oasa-secscheme.js').oasa_secscheme;
const oasa_operation = require('./oasa-operation.js').oasa_operation;


class oasa_spec {
    constructor (oasd, opts) {
        if (!oasd)
            throw new Error('no OpenAPI specification (first parameter)');
        if (!oasd.openapi)
            throw new Error('not an OpenAPI specification');
        if (!/^3\./.exec(oasd.openapi))
            throw new Error('only OpenAPI version 3 is supported');

        if (!opts)
            opts = {};

        if (opts.debug === true)
            this._logger = function (level, msg) {
                if (level === 'warn')
                    console.warn(msg);
                else if (level === 'error')
                    console.error(msg);
                else
                    console.log(msg);
            };
        else if (typeof opts.debug === 'function')
            this._logger = opts.debug;
        else if (typeof opts.debug === 'undefined' || opts.debug === false)
            this._logger = function () {};
        else
            throw new Error('debug must be true, false, undefined or a function');

        if (oasd.servers) {
            if (!(oasd.servers instanceof Array))
                throw new Error('OpenAPI specification validation failed, servers is not an array');
            for (const server of oasd.servers)
                if (!server.url)
                    throw new Error('OpenAPI specification validation failed, server without url');
        } else {
            oasd.servers = [];
        }

        if (!oasd.paths)
            oasd.paths = {};

        this._oasd = oasd;
    }

    servers () {
        return this._oasd.servers.map((server) => server.url);
    }

    title () {
        return this._oasd.title;
    }

    resolve_ref (ref) {
        let match = /^#\/components\/(\S+)\/(\S+)$/.exec(ref);

        if (!match)
            throw new Error('malformed ref '+ref);

        let def_type = match[1];
        let def_name = match[2];

        if (['parameters', 'responses', 'headers', 'examples', 'links', 'callbacks'].includes(def_type))
            throw new Error(`component type "${def_type}" not supported`);

        if (!['schemas', 'requestBodies', 'securitySchemes'].includes(def_type))
            throw new Error(`component type "${def_type}" is invalid`);

        if (!this._oasd.components)
            return undefined;
        if (!this._oasd.components[def_type])
            return undefined;
        if (!this._oasd.components[def_type][def_name])
            return undefined;

        let component_oasd = this._oasd.components[def_type][def_name];

        if (def_type === 'schemas')
            return new oasa_schema(this, component_oasd, def_name);
        else if (def_type === 'requestBodies')
            return new oasa_reqbody(this, component_oasd);
        else if (def_type === 'securitySchemes')
            return new oasa_secscheme(this, component_oasd, def_name, undefined);
    }

    operations () {
        if (this._op_list)
            return Object.values(this._op_list);

        this._op_list = Object.keys(this._oasd.paths).reduce((acc, path) => {
            return Object.keys(this._oasd.paths[path]).reduce((acc, method) => {
                acc.push(new oasa_operation(
                    this,
                    this._oasd.paths[path][method],
                    path,
                    method
                ));
                return acc;
            }, acc);
        }, []);

        this._op_map = this._op_list.reduce((acc, op) => {
            acc[op.id()] = op;
            return acc;
        }, {});

        return this._op_list;
    }


    named_operation (name) {
        if (!this._op_map)
            this.operations();

        return this._op_map[name];
    }
}


module.exports = {
    'oasa_spec': oasa_spec,
};

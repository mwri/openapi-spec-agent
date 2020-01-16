const lodash = require('lodash');
const assert = require('assert');

const oasa_spec   = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_param  = require('./../lib/oasa-param.js').oasa_param;
const oasa_schema = require('./../lib/oasa-schema.js').oasa_schema;


const min_sample_oasd = {
    'openapi': '3.0.0',
};


describe('oasa_param', function () {
    describe('new', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('throws if no spec given', function () {
            assert.throws(() => new oasa_param(undefined, {}));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_param(this._spec, undefined));
        });

        it('given spec and parameter def, returns oasa_param object', function () {
            assert(new oasa_param(this._spec, {}) instanceof oasa_param);
        });
    });

    describe('name', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}});
        });

        it('returns a string', function () {
            assert.equal(typeof this._param.name(), 'string');
        });

        it('returns the parameter name', function () {
            assert.equal(this._param.name(), 'param1');
        });
    });

    describe('in', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}});
        });

        it('returns a string', function () {
            assert.equal(typeof this._param.in(), 'string');
        });

        it('returns the parameter type/location', function () {
            assert.equal(this._param.in(), 'query');
        });
    });

    describe('descr', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}, 'description': 'parameter description'});
        });

        it('returns a string', function () {
            assert.equal(typeof this._param.descr(), 'string');
        });

        it('returns the parameter description', function () {
            assert.equal(this._param.descr(), 'parameter description');
        });
    });

    describe('required', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}});
        });

        it('when required not specified, returns a boolean', function () {
            assert.equal(typeof this._param.required(), 'boolean');
        });

        it('returns required specification when given', function () {
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}, 'required': true});
            assert.equal(this._param.required(), true);

            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}, 'required': false});
            assert.equal(this._param.required(), false);
        });

        it('returns true for "path" parameters, when required not specified', function () {
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'path', 'schema': {'type': 'string'}});
            assert.equal(this._param.required(), true);
        });

        it('returns false for "query" parameters, when required not specified', function () {
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}});
            assert.equal(this._param.required(), false);
        });

        it('returns false for "header" parameters, when required not specified', function () {
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'header', 'schema': {'type': 'string'}});
            assert.equal(this._param.required(), false);
        });

        it('returns false for "cookie" parameters, when required not specified', function () {
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'cookie', 'schema': {'type': 'string'}});
            assert.equal(this._param.required(), false);
        });
    });

    describe('schema', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._param = new oasa_param(this._spec, {'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}});
        });

        it('returns an oasa_schema object', function () {
            assert(this._param.schema() instanceof oasa_schema);
        });
    });
});

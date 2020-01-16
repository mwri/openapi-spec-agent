const assert = require('assert');
const lodash = require('lodash');

const oasa_spec      = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_operation = require('./../lib/oasa-operation.js').oasa_operation;
const oasa_response  = require('./../lib/oasa-response.js').oasa_response;
const oasa_secscheme = require('./../lib/oasa-secscheme.js').oasa_secscheme;
const oasa_reqbody   = require('./../lib/oasa-reqbody.js').oasa_reqbody;
const oasa_param     = require('./../lib/oasa-param.js').oasa_param;


const min_sample_oasd = {
    'openapi': '3.0.0',
};


describe('oasa_operation', function () {
    beforeEach(function () {
        this._min_sample_oasd = lodash.cloneDeep(min_sample_oasd);
        this._spec = new oasa_spec(this._min_sample_oasd);
    });

    describe('new', function () {
        it('throws if no spec given', function () {
            assert.throws(() => new oasa_operation(undefined, {}, '/path1', 'get'));
        });

        it('throws if no path given', function () {
            assert.throws(() => new oasa_operation(this._spec, {}, undefined, 'get'));
        });

        it('throws if no method given', function () {
            assert.throws(() => new oasa_operation(this._spec, {}, '/path1', undefined));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_operation(this._spec, undefined, '/path1', 'get'));
        });

        it('given spec, path, method and operation schema def, returns oasa_operation object', function () {
            assert(new oasa_operation(this._spec, {}, '/path1', 'get') instanceof oasa_operation);
        });
    });

    describe('path', function () {
        it('returns a string', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {}, '/path1', 'get');
            assert.equal(typeof op.path(), 'string');
        });

        it('returns the path without leading slash', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op1   = new oasa_operation(spec, {}, '/path1', 'get');
            assert.equal(op1.path(), 'path1');
            let op2   = new oasa_operation(spec, {}, 'path2', 'get');
            assert.equal(op2.path(), 'path2');
        });
    });

    describe('method', function () {
        it('returns a string', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {}, '/path1', 'get');
            assert.equal(typeof op.method(), 'string');
        });

        it('returns the method', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            assert.equal((new oasa_operation(spec, {}, '/path1', 'get')).method(), 'GET');
            assert.equal((new oasa_operation(spec, {}, '/path1', 'post')).method(), 'POST');
        });
    });

    describe('id', function () {
        it('returns a string', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'operationId': 'getThing'}, '/path1', 'get');
            assert.equal(typeof op.id(), 'string');
        });

        it('returns the operation ID', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'operationId': 'getThing'}, '/path1', 'get');
            assert.equal(op.id(), 'getThing');
        });
    });

    describe('summary', function () {
        it('returns a string', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'summary': 'op summary'}, '/path1', 'get');
            assert.equal(typeof op.summary(), 'string');
        });

        it('returns the summary', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'summary': 'op summary'}, '/path1', 'get');
            assert.equal(op.summary(), 'op summary');
        });
    });

    describe('tags', function () {
        it('returns an array', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'tags': ['tag1', 'tag2']}, '/path1', 'get');
            assert(op.tags() instanceof Array);
        });

        it('returns tags', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'tags': ['tag1', 'tag2']}, '/path1', 'get');
            assert.deepEqual(op.tags().sort(), ['tag1', 'tag2'].sort());
        });
    });

    describe('params', function () {
        it('with no params, returns an array', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {}, '/path1', 'get');
            assert(op.params() instanceof Array);
        });

        it('with empty params, returns an array', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'parameters': []}, '/path1', 'get');
            assert(op.params() instanceof Array);
        });

        it('with some params, returns an array of oasa_param objects', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'parameters': [{'name': 'param1', 'in': 'query', 'schema': {'type': 'string'}}]}, '/path1', 'get');
            assert(op.params() instanceof Array);
            for (const param of op.params())
                assert(param instanceof oasa_param);
        });
    });

    describe('responses', function () {
        it('returns an array', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'tags': ['tag1', 'tag2']}, '/path1', 'get');
            assert(op.responses() instanceof Array);
        });

        it('returns an array of the oasa_response objects', function () {
            let spec = new oasa_spec(this._min_sample_oasd);
            let op   = new oasa_operation(spec, {'responses': {'200': {}, '400': {}}}, '/path1', 'get');
            assert.equal(op.responses().length, 2);
            for (const res of op.responses())
                assert(res instanceof oasa_response);
        });
    });

    describe('security', function () {
        this.beforeEach(function () {
            this._min_sample_oasd.components = {'securitySchemes': {'secscheme_name': []}};
            this._spec = new oasa_spec(this._min_sample_oasd);
        });

        it('when no security, returns an empty array', function () {
            let op = new oasa_operation(this._spec, {}, '/path1', 'get');
            assert(op.security() instanceof Array);
            assert.equal(op.security().length, 0);
        });

        it('when security, returns an array', function () {
            let op = new oasa_operation(this._spec, {'security': [{'secscheme_name': []}]}, '/path1', 'get');
            assert(op.security() instanceof Array);
            assert.equal(op.security().length, 1);
        });

        it('returns an array of the oasa_secscheme objects', function () {
            let op = new oasa_operation(this._spec, {'security': [{'secscheme_name': []}]}, '/path1', 'get');
            assert.equal(op.security().length, 1);
            for (const ss of op.security())
                assert(ss instanceof oasa_secscheme);
        });

        it('returns an array of the oasa_secscheme objects with correct scopes', function () {
            let op = new oasa_operation(this._spec, {'security': [{'secscheme_name': ['some_scope']}]}, '/path1', 'get');
            assert.equal(op.security().length, 1);
            assert.deepEqual(op.security()[0].scopes(), ['some_scope']);
        });
    });

    describe('req_body', function () {
        it('when there is no request body, returns undefined', function () {
            let op = new oasa_operation(this._spec, {}, '/path1', 'get');
            assert.equal(op.req_body(), undefined);
        });

        it('when there is a literal request body, returns oasa_reqbody object', function () {
            let op = new oasa_operation(this._spec, {'requestBody': {'content': {'application/json': {'schema': {'type': 'object'}}}}}, '/path1', 'get');
            assert(op.req_body() instanceof oasa_reqbody);
        });

        it('when there is a referened request body, returns oasa_reqbody object', function () {
            this._min_sample_oasd.components = {'requestBodies': {'reqbody1': {'content': {'application/json': {'schema': {'type': 'object'}}}}}};
            this._spec = new oasa_spec(this._min_sample_oasd);

            let op = new oasa_operation(this._spec, {'requestBody': {'$ref': '#/components/requestBodies/reqbody1'}}, '/path1', 'get');
            assert(op.req_body() instanceof oasa_reqbody);
        });
    });

    describe('request', function () {
        beforeEach(function () {
            this._op_oasd = {'parameters': [
                {'name': 'foo', 'in': 'query'},
                {'name': 'bar', 'in': 'query'},
                {'name': 'baz', 'in': 'path'},
            ]};
        });

        it('returns a valid URL concatenation of server and operation path', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'get')).request('http://server1/xx/yy').url,
                'http://server1/xx/yy/path1'
            );
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'get')).request('http://server1/xx/yy/').url,
                'http://server1/xx/yy/path1'
            );
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, '/path1', 'get')).request('http://server1/xx/yy').url,
                'http://server1/xx/yy/path1'
            );
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, '/path1', 'get')).request('http://server1/xx/yy/').url,
                'http://server1/xx/yy/path1'
            );
        });

        it('returns a URL with URL encoded query parameters added', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'get'))
                    .request('http://server1/xx/yy', {'foo': 'fooval'}).url,
                'http://server1/xx/yy/path1?foo=fooval'
            );

            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'get'))
                    .request('http://server1/xx/yy', {'foo': 'fooval', 'bar': 'bar&val'}).url,
                'http://server1/xx/yy/path1?foo=fooval&bar=bar%26val'
            );
        });

        it('returns a URL with path parameters incorporated', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1/{baz}', 'get'))
                    .request('http://server1/xx/yy', {'baz': 'bazval'}).url,
                'http://server1/xx/yy/path1/bazval'
            );

            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'get'))
                    .request('http://server1/xx/yy', {'foo': 'fooval', 'bar': 'bar&val'}).url,
                'http://server1/xx/yy/path1?foo=fooval&bar=bar%26val'
            );
        });

        it('returns a method', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'get'))
                    .request('http://server1/xx/yy', {'foo': 'fooval'}).method,
                'GET'
            );

            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'post'))
                    .request('http://server1/xx/yy', {'foo': 'fooval', 'bar': 'bar&val'}).method,
                'POST'
            );
        });

        it('when the content type is application/json, returns a JSON encoded body', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'post'))
                    .request('http://server1/xx/yy', {}, 'application/json', {'foo': 'bar'}).body,
                JSON.stringify({'foo': 'bar'})
            );
        });

        it('when the content type is plain/text, returns a body unencoded', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'post'))
                    .request('http://server1/xx/yy', {}, 'plain/text', 'texty_body').body,
                'texty_body'
            );
        });

        it('when the content type is application/octet-stream, returns a body unencoded', function () {
            assert.equal(
                (new oasa_operation(this._spec, this._op_oasd, 'path1', 'post'))
                    .request('http://server1/xx/yy', {}, 'application/octet-stream', 'binary_body').body,
                'binary_body'
            );
        });
    });
});

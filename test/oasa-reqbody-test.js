const assert = require('assert');

const oasa_spec    = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_schema  = require('./../lib/oasa-schema.js').oasa_schema;
const oasa_reqbody = require('./../lib/oasa-reqbody.js').oasa_reqbody;


const min_sample_oasd = {
    'openapi': '3.0.0',
};

const min_sample_reqbody_oasd = {
    'content': {
        'application/json': {
            'schema': {
                'type': 'object',
            },
        },
        'text/plain': {
            'schema': {
                'type': 'string',
            },
        },
    },
};


describe('oasa_reqbody', function () {
    describe('new', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('throws if no spec given', function () {
            assert.throws(() => new oasa_reqbody(undefined, min_sample_reqbody_oasd));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_reqbody(this._spec, undefined));
        });

        it('throws if no content type (no keys) in oasd given', function () {
            assert.throws(() => new oasa_reqbody(this._spec, {}));
        });

        it('throws if multiple content types in oasd', function () {
            assert.throws(() => new oasa_reqbody(this._spec, {'application/json': {'type': 'object'}, 'text/plain': {'type': 'object'}}));
        });

        it('throws if content type schema in oasd is invalid', function () {
            assert.throws(() => new oasa_reqbody(this._spec, {'application/json': {}}));
        });

        it('given spec and content def, returns oasa_reqbody object', function () {
            assert(new oasa_reqbody(this._spec, min_sample_reqbody_oasd) instanceof oasa_reqbody);
        });
    });

    describe('content_type', function () {
        beforeEach(function () {
            this._spec    = new oasa_spec(min_sample_oasd);
            this._reqbody = new oasa_reqbody(this._spec, min_sample_reqbody_oasd);
        });

        it('returns an array', function () {
            assert(this._reqbody.content_types() instanceof Array);
        });

        it('returns an array of the content types', function () {
            assert.deepEqual(this._reqbody.content_types(), ['application/json', 'text/plain']);
        });
    });

    describe('schema', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._reqbody = new oasa_reqbody(this._spec, min_sample_reqbody_oasd);
        });

        it('throws if no content type given', function () {
            assert.throws(() => this._reqbody.schema());
        });

        it('returns a schema object, given a supported content type', function () {
            assert(this._reqbody.schema('application/json') instanceof oasa_schema);
            assert(this._reqbody.schema('text/plain') instanceof oasa_schema);
        });

        it('returns undefined, given an unsupported content type', function () {
            assert.equal(this._reqbody.schema('some/other'), undefined);
        });

        it('returns the schema relating to the content type', function () {
            assert.equal(this._reqbody.schema('application/json').type(), 'object');
            assert.equal(this._reqbody.schema('text/plain').type(), 'string');
        });
    });
});

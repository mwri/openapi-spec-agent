const assert = require('assert');

const oasa_spec    = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_schema  = require('./../lib/oasa-schema.js').oasa_schema;
const oasa_content = require('./../lib/oasa-content.js').oasa_content;


const min_sample_oasd = {
    'openapi': '3.0.0',
};

const min_sample_content_oasd = {
    'application/json': {
        'schema': {
            'type': 'object'
        }
    },
    'text/plain': {
        'schema': {
            'type': 'string'
        },
    },
};


describe('oasa_content', function () {
    describe('new', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('throws if no spec given', function () {
            assert.throws(() => new oasa_content(undefined, min_sample_content_oasd));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_content(this._spec, undefined));
        });

        it('throws if no content type (no keys) in oasd given', function () {
            assert.throws(() => new oasa_content(this._spec, {}));
        });

        it('given spec and content def, returns oasa_content object', function () {
            assert(new oasa_content(this._spec, min_sample_content_oasd) instanceof oasa_content);
        });
    });

    describe('content_types', function () {
        beforeEach(function () {
            this._spec    = new oasa_spec(min_sample_oasd);
            this._content = new oasa_content(this._spec, min_sample_content_oasd);
        });

        it('returns an array', function () {
            assert(this._content.content_types() instanceof Array);
        });

        it('returns an array of the content types', function () {
            assert.deepEqual(this._content.content_types(), ['application/json', 'text/plain']);
        });
    });

    describe('schema', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._content = new oasa_content(this._spec, min_sample_content_oasd);
        });

        it('throws if no content type given', function () {
            assert.throws(() => this._content.schema());
        });

        it('returns a schema object, given a supported content type', function () {
            assert(this._content.schema('application/json') instanceof oasa_schema);
            assert(this._content.schema('text/plain') instanceof oasa_schema);
        });

        it('returns undefined, given an unsupported content type', function () {
            assert.equal(this._content.schema('some/other'), undefined);
        });

        it('returns the schema relating to the content type', function () {
            assert.equal(this._content.schema('application/json').type(), 'object');
            assert.equal(this._content.schema('text/plain').type(), 'string');
        });

        it('when schema is a reference, returns a schema object', function () {
            this._spec_oasd = {
                'openapi': '3.0.0',
                'components': {'schemas': {'some_object': {'type': 'object'}}},
            };
            this._content_oasd = {'application/json': {'schema': {'$ref': '#/components/schemas/some_object'}}};
            this._spec = new oasa_spec(this._spec_oasd);
            this._content = new oasa_content(this._spec, this._content_oasd);
            assert(this._content.schema('application/json') instanceof oasa_schema);
        });
    });
});

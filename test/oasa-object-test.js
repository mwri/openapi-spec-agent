const assert = require('assert');

const oasa_spec   = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_object = require('./../lib/oasa-object.js').oasa_object;
const oasa_schema = require('./../lib/oasa-schema.js').oasa_schema;


const min_sample_oasd = {
    'openapi': '3.0.0',
};


describe('oasa_schema', function () {
    beforeEach(function () {
        this._spec = new oasa_spec(min_sample_oasd);
        this._schema_oasd = {
            'type': 'object',
            'required': ['must', 'mandatory'],
            'properties': {
                'must': {'type': 'string'},
                'mandatory': {'type': 'string'},
                'maybe': {'type': 'string'},
                'optional': {'type': 'string'},
                'subobject': {
                    'type': 'object',
                    'required': ['submust', 'submandatory'],
                    'properties': {
                        'submust': {'type': 'string'},
                        'submandatory': {'type': 'string'},
                        'submaybe': {'type': 'string'},
                        'suboptional': {'type': 'string'},
                    },
                },
            },
        };
        this._schema = new oasa_schema(this._spec, this._schema_oasd);
        this._data = {
            'must': 'foo1',
            'mandatory': 'bar1',
            'maybe': 'baz1',
            'optional': 'bat1',
        };
    });

    describe('new', function () {
        it('throws if no spec given', function () {
            assert.throws(() => new oasa_object(undefined, {}, this._schema));
        });

        it('throws if no schema given', function () {
            assert.throws(() => new oasa_object(this._spec, {}, undefined));
        });

        it('throws if no data given', function () {
            assert.throws(() => new oasa_object(this._spec, undefined, this._schema));
        });
    });

    describe('prop', function () {
        describe('for string properties', function () {
            it('returns properties from the source data', function () {
                let obj = new oasa_object(this._spec, this._data, this._schema);
                assert.equal(obj.prop('must'), 'foo1');
                assert.equal(obj.prop('mandatory'), 'bar1');
                assert.equal(obj.prop('maybe'), 'baz1');
                assert.equal(obj.prop('optional'), 'bat1');
            });

            it('returns undefined for properties not in the schema', function () {0
                this._data.extra = 'boo1';
                let obj = new oasa_object(this._spec, this._data, this._schema);
                assert.equal(obj.prop('extra'), undefined);
            });

            it('returns undefined for properties in the schema but not the data', function () {0
                delete this._data.optional;
                let obj = new oasa_object(this._spec, this._data, this._schema);
                assert.equal(obj.prop('optional'), undefined);
            });
        });

        describe('for object properties', function () {
            beforeEach(function () {
                this._data.subobject = {
                    'submust': 'subfoo3',
                    'submandatory': 'subbar3',
                };
                this._obj = new oasa_object(this._spec, this._data, this._schema);
            });

            it('returns an oasa_object object', function () {0
                //assert(this._obj.prop('subobject') instanceof oasa_object);
            });

            it('returns an oasa_object with properties from the source (sub) data', function () {0
                assert.equal(this._obj.prop('subobject').prop('submust'), 'subfoo3');
                assert.equal(this._obj.prop('subobject').prop('submandatory'), 'subbar3');
            });
        });
    });

    describe('schema', function () {
        it('returns the schema', function () {
            let obj = new oasa_object(this._spec, this._data, this._schema);
            assert.equal(obj.schema(), this._schema);
        });
    });
});

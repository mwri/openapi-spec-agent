const lodash = require('lodash');
const assert = require('assert');

const oasa_spec     = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_schema   = require('./../lib/oasa-schema.js').oasa_schema;
const oasa_property = require('./../lib/oasa-schema.js').oasa_property;
const oasa_object   = require('./../lib/oasa-object.js').oasa_object;


const min_sample_oasd = {
    'openapi': '3.0.0',
};


describe('oasa_schema', function () {
    describe('new', function () {
        it('throws if no spec given', function () {
            assert.throws(() => new oasa_schema());
        });

        it('throws if no schema oasd given', function () {
            assert.throws(() => new oasa_schema(new oasa_spec(min_sample_oasd)));
        });

        it('throws if schema has no type', function () {
            assert.throws(() => new oasa_schema(new oasa_spec(min_sample_oasd), {}));
        });

        it('throws if schema has invalid type', function () {
            assert.throws(() => new oasa_schema(new oasa_spec(min_sample_oasd), {'type': 'bad'}));
            assert.throws(() => new oasa_schema(new oasa_spec(min_sample_oasd), {'type': 'invalid'}));
        });

        it('given object schema, returns oasa_schema object', function () {
            assert(new oasa_schema(new oasa_spec(min_sample_oasd), {'type': 'object'}) instanceof oasa_schema);
        });

        it('given array schema, returns oasa_schema object', function () {
            assert(new oasa_schema(new oasa_spec(min_sample_oasd), {'type': 'array'}) instanceof oasa_schema);
        });
    });

    describe('with object schema', function () {
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
                },
            };
        });

        describe('name', function () {
            it('if no name was given, returns undefined', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.equal(schema.name(), undefined);
            });

            it('if name was given, returns a string', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd, 'objname');
                assert.equal(typeof schema.name(), 'string');
            });

            it('if name was given, returns the name', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd, 'objname');
                assert.equal(schema.name(), 'objname');
            });
        });

        describe('type', function () {
            it('returns "object"', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.type() === 'object');
            });
        });

        describe('required_props', function () {
            it('returns empty array when schema has no properties', function () {
                delete this._schema_oasd.properties;
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.required_props() instanceof Array);
                assert.equal(schema.required_props().length, 0);
            });

            it('returns empty array when schema has no required', function () {
                delete this._schema_oasd.required;
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.required_props() instanceof Array);
                assert.equal(schema.required_props().length, 0);
            });

            it('returns list of required properties', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.deepEqual(
                    schema.required_props().map((p) => p.name()).sort(),
                    ['must', 'mandatory'].sort()
                );
            });
        });

        describe('all_props', function () {
            it('returns empty array when schema has no properties', function () {
                delete this._schema_oasd.properties;
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.all_props() instanceof Array);
                assert.equal(schema.all_props().length, 0);
            });

            it('returns all properties', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.deepEqual(
                    schema.all_props().map((p) => p.name()).sort(),
                    ['must', 'mandatory', 'maybe', 'optional'].sort()
                );
            });
        });

        describe('optional_props', function () {
            it('returns empty array when schema has no properties', function () {
                delete this._schema_oasd.properties;
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.optional_props() instanceof Array);
                assert.equal(schema.optional_props().length, 0);
            });

            it('returns optional properties', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.deepEqual(
                    schema.optional_props().map((p) => p.name()).sort(),
                    ['maybe', 'optional'].sort()
                );
            });
        });

        describe('named_prop', function () {
            it('returns undefined when the schema has no property with the specified name', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.equal(schema.named_prop('noexists'), undefined);
                assert.equal(schema.named_prop('nonsense'), undefined);
            });

            it('returns a property', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.named_prop('must') instanceof oasa_property);
                assert(schema.named_prop('maybe') instanceof oasa_property);
            });

            it('returns specified property', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.equal(schema.named_prop('must').name(), 'must');
                assert.equal(schema.named_prop('maybe').name(), 'maybe');
            });
        });

        describe('of', function () {
            it('throws', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.throws(() => schema.of());
            });
        });

        describe('interpret', function () {
            this.beforeEach(function () {
                this._schema = new oasa_schema(this._spec, this._schema_oasd);
                this._data = {
                    'must': 'foo1',
                    'mandatory': 'bar1',
                    'maybe': 'baz1',
                    'optional': 'bat1',
                };
            });

            it('returns an oasa_object', function () {
                assert(this._schema.interpret(this._data) instanceof oasa_object);
            });

            it('returns an oasa_object with properties of the source data', function () {
                let obj = this._schema.interpret(this._data);
                assert.equal(obj.prop('must'), 'foo1');
                assert.equal(obj.prop('mandatory'), 'bar1');
                assert.equal(obj.prop('maybe'), 'baz1');
                assert.equal(obj.prop('optional'), 'bat1');
            });
        });
    });

    describe('with array schema', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._schema_oasd = {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'required': ['must', 'mandatory'],
                    'properties': {
                        'must': {'type': 'string'},
                        'mandatory': {'type': 'string'},
                        'maybe': {'type': 'string'},
                        'optional': {'type': 'string'},
                    },
                },
            };
        });

        describe('name', function () {
            it('if no name was given, returns undefined', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.equal(schema.name(), undefined);
            });

            it('if name was given, returns a string', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd, 'listname');
                assert.equal(typeof schema.name(), 'string');
            });

            it('if name was given, returns the name', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd, 'listname');
                assert.equal(schema.name(), 'listname');
            });
        });

        describe('type', function () {
            it('returns "array"', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.type() === 'array');
            });
        });

        describe('of', function () {
            it('throws when no items', function () {
                delete this._schema_oasd.items;
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert.throws(() => schema.of());
            });

            describe('when items has reference', function () {
                beforeEach(function () {
                    let spec_oasd = lodash.cloneDeep(min_sample_oasd);
                    spec_oasd.components = {'schemas': {'exists': {'type': 'object'}}};
                    this._spec = new oasa_spec(spec_oasd);
                });

                it('when reference exists, returns oasa_schema object', function () {
                    this._schema_oasd.items = {'$ref': '#/components/schemas/exists'};
                    let schema = new oasa_schema(this._spec, this._schema_oasd);
                    assert(schema.of() instanceof oasa_schema);
                });

                it('when reference does not exist, returns undefined', function () {
                    this._schema_oasd.items = {'$ref': '#/components/schemas/not_found'};

                    let schema = new oasa_schema(this._spec, this._schema_oasd);
                    assert.equal(schema.of(), undefined);
                });
            });

            it('when items has sub schema, returns oasa_schema object', function () {
                let schema = new oasa_schema(this._spec, this._schema_oasd);
                assert(schema.of() instanceof oasa_schema);
            });

            describe('returns oasa_schema object for which', function () {
                beforeEach(function () {
                    this._schema = new oasa_schema(this._spec, this._schema_oasd);
                });

                describe('type', function () {
                    it('when items subschema is an object, returns "object"', function () {
                        let of = this._schema.of();
                        assert.equal(of.type(), 'object');
                    });
                });
            });
        });

        describe('interpret', function () {
            this.beforeEach(function () {
                this._schema = new oasa_schema(this._spec, this._schema_oasd);
                this._data = [{
                    'must': 'foo1',
                    'mandatory': 'bar1',
                    'maybe': 'baz1',
                    'optional': 'bat1',
                }, {
                    'must': 'foo2',
                    'mandatory': 'bar2',
                    'maybe': 'baz2',
                    'optional': 'bat2',
                }];
            });

            it('returns an array', function () {
                assert(this._schema.interpret(this._data) instanceof Array);
            });

            it('returns an array of oasa_object objects', function () {
                let objlist = this._schema.interpret(this._data);
                assert(objlist instanceof Array);
                assert.equal(objlist.length, this._data.length);
                for (const obj of objlist)
                    assert(obj instanceof oasa_object);
            });

            it('returns an array of oasa_object objects', function () {
                let objlist = this._schema.interpret(this._data);
                assert(objlist instanceof Array);
                assert.equal(objlist.length, this._data.length);

                assert(objlist[0] instanceof oasa_object);
                assert.equal(objlist[0].prop('must'), 'foo1');
                assert.equal(objlist[0].prop('mandatory'), 'bar1');
                assert.equal(objlist[0].prop('maybe'), 'baz1');
                assert.equal(objlist[0].prop('optional'), 'bat1');

                assert(objlist[1] instanceof oasa_object);
                assert.equal(objlist[1].prop('must'), 'foo2');
                assert.equal(objlist[1].prop('mandatory'), 'bar2');
                assert.equal(objlist[1].prop('maybe'), 'baz2');
                assert.equal(objlist[1].prop('optional'), 'bat2');
            });
        });
    });
});


describe('oasa_property', function () {
    describe('new', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('throws if no spec given', function () {
            assert.throws(() => new oasa_property(undefined, {}, 'propname'));
        });

        it('throws if no name given', function () {
            assert.throws(() => new oasa_property(this._spec, {}, undefined));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_property(this._spec, undefined, 'propname'));
        });

        it('given spec, name and property def, returns oasa_property object', function () {
            assert(new oasa_property(this._spec, {}, 'propname') instanceof oasa_property);
        });
    });

    describe('name', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._prop = new oasa_property(this._spec, {}, 'propname');
        });

        it('returns a string', function () {
            assert.equal(typeof this._prop.name(), 'string');
        });

        it('returns the property name', function () {
            assert.equal(this._prop.name(), 'propname');
        });
    });

    describe('type', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._prop = new oasa_property(this._spec, {'type': 'object'}, 'propname');
        });

        it('returns a string', function () {
            assert.equal(typeof this._prop.type(), 'string');
        });

        it('returns the content type', function () {
            assert.equal(this._prop.type(), 'object');
        });
    });

    describe('descr', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._prop = new oasa_property(this._spec, {'description': 'property description'}, 'propname');
        });

        it('returns a string', function () {
            assert.equal(typeof this._prop.descr(), 'string');
        });

        it('returns the property description', function () {
            assert.equal(this._prop.descr(), 'property description');
        });
    });

    describe('enum', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('if no enumeration values, returns undefined', function () {
            this._prop = new oasa_property(this._spec, {}, 'propname');
            assert.equal(this._prop.enum(), undefined);
        });

        it('returns an array', function () {
            this._prop = new oasa_property(this._spec, {'enum': ['this', 'that', 'theother']}, 'propname');
            assert(this._prop.enum() instanceof Array);
        });

        it('returns the array of enumeration values', function () {
            this._prop = new oasa_property(this._spec, {'enum': ['this', 'that', 'theother']}, 'propname');
            assert.deepEqual(this._prop.enum(), ['this', 'that', 'theother']);
        });
    });

    describe('example', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._prop = new oasa_property(this._spec, {'example': 'example_value'}, 'propname');
        });

        it('returns a string', function () {
            assert.equal(typeof this._prop.example(), 'string');
        });

        it('returns the content example', function () {
            assert.equal(this._prop.example(), 'example_value');
        });
    });

    describe('with object type', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._prop = new oasa_property(this._spec, {'type': 'object'}, 'propname');
        });

        describe('schema', function () {
            it('returns an oasa_schema object', function () {
                assert(this._prop.schema() instanceof oasa_schema);
            });
        });
    });
});

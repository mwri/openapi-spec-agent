const assert = require('assert');
const sinon = require('sinon');

const oasa_spec      = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_schema    = require('./../lib/oasa-schema.js').oasa_schema;
const oasa_reqbody   = require('./../lib/oasa-reqbody.js').oasa_reqbody;
const oasa_secscheme = require('./../lib/oasa-secscheme.js').oasa_secscheme;
const oasa_operation = require('./../lib/oasa-operation.js').oasa_operation;
const oasa_object    = require('./../lib/oasa-object.js').oasa_object;


describe('oasa_spec', function () {
    beforeEach(function () {
        this._min_sample_oasd = {
            'openapi': '3.0.0',
        };
    })

    describe('new', function () {
        it('returns oasa_spec object', function () {
            assert(new oasa_spec(this._min_sample_oasd) instanceof oasa_spec);
        });

        it('throws if no spec given', function () {
            assert.throws(() => new oasa_spec());
        });

        it('throws if no spec given', function () {
             new oasa_spec(this._min_sample_oasd);
        });

        it('throws if empty spec given', function () {
            assert.throws(() => new oasa_spec({}));
        });

        it('throws if spec is not version 3', function () {
            assert.throws(() => new oasa_spec({'openapi': '2.4.6'}));
            assert.throws(() => new oasa_spec({'openapi': '1.2.3'}));
            assert.throws(() => new oasa_spec({'openapi': '4.5.6'}));
            assert.throws(() => new oasa_spec({'openapi': '0.0.1'}));
        });

        it('throws if servers included but not array', function () {
            assert.throws(() => new oasa_spec({'openapi': '3.0.0', 'servers': {}}));
        });

        it('throws if any servers do not have a url', function () {
            assert.throws(() => new oasa_spec({'openapi': '3.0.0', 'servers': [{}]}));
            assert.throws(() => new oasa_spec({'openapi': '3.0.0', 'servers': [{'foo': 'bar'}]}));
        });

        it('returns oasa_spec object for spec with servers', function () {
            assert(new oasa_spec({'openapi': '3.0.0', 'servers': [{'url': 'some_url'}]}) instanceof oasa_spec);
        });

        it('throws if debug is string or number', function () {
            assert.throws(() => new oasa_spec(this._min_sample_oasd, {'debug': 1}));
            assert.throws(() => new oasa_spec(this._min_sample_oasd, {'debug': 'foobar'}));
        });

        describe('with debug enabled (default logger)', function () {
            beforeEach(function () {
                this._log_stub = sinon.stub(console, 'log');
                this._warn_stub = sinon.stub(console, 'warn');
                this._error_stub = sinon.stub(console, 'error');
            });

            afterEach(function () {
                this._log_stub.restore();
                this._warn_stub.restore();
                this._error_stub.restore();
            });

            it('info dispatched to console.log', function () {
                let spec = new oasa_spec(this._min_sample_oasd, {'debug': true});
                spec._logger('info', 'info msg');
                assert(this._log_stub.calledWith('info msg'));
            });

            it('warn dispatched to console.warn', function () {
                let spec = new oasa_spec(this._min_sample_oasd, {'debug': true});
                spec._logger('warn', 'warn msg');
                assert(this._warn_stub.calledWith('warn msg'));
            });

            it('error dispatched to console.error', function () {
                let spec = new oasa_spec(this._min_sample_oasd, {'debug': true});
                spec._logger('error', 'error msg');
                assert(this._error_stub.calledWith('error msg'));
            });
        });
    });

    describe('servers', function () {
        it('with no servers, returns an empty array', function () {
            assert((new oasa_spec(this._min_sample_oasd)).servers() instanceof Array);
            assert.equal((new oasa_spec(this._min_sample_oasd)).servers().length, 0);
        });

        it('with servers, returns an array', function () {
            let oasd = this._min_sample_oasd;
            oasd.servers = [{'url': 'http://host/'}];
            assert((new oasa_spec(oasd)).servers() instanceof Array);
        });

        it('returns an array of URLs as strings, one for each server', function () {
            let oasd = this._min_sample_oasd;
            oasd.servers = [{'url': 'http://host/'}];
            assert((new oasa_spec(oasd)).servers() instanceof Array);
            assert((new oasa_spec(oasd)).servers().length === 1);
            oasd.servers = [{'url': 'http://host:1/'}, {'url': 'http://host:2/'}];
            assert((new oasa_spec(oasd)).servers() instanceof Array);
            assert((new oasa_spec(oasd)).servers().length === 2);
        });
    });

    describe('title', function () {
        it('with no title, returns undefined', function () {
            assert((new oasa_spec(this._min_sample_oasd)).title() === undefined);
        });

        it('with a title, returns title', function () {
            let oasd = this._min_sample_oasd;
            oasd.title = 'some title';
            assert.equal((new oasa_spec(oasd)).title(), 'some title');
        });
    });

    describe('resolve_ref', function () {
        it('throws if malformed', function () {
            for (const bogus_ref of ['', '#', '#/', '#/bad', '#/components/', '#/components/bad/',
                                     '#/components/schemas', '#/components/schemas', '#/components/bad',
                                     '#/components/requestBodies', '#/components/requestBodies/',
                                     '#/components/securitySchemes', '#/components/securitySchemes/'])
                assert.throws(() => {
                    (new oasa_spec(this._min_sample_oasd)).resolve_ref(bogus_ref)
                    console.error(`ref "${bogus_ref}" did not cause throw`);
                });
        });

        it('throws if component type is invalid', function () {
            for (const bogus_ref of ['#/components/invalid/something'])
                assert.throws(() => {
                    (new oasa_spec(this._min_sample_oasd)).resolve_ref(bogus_ref)
                    console.error(`ref "${bogus_ref}" did not cause throw`);
                });
        });

        it('throws if component type is unsupported', function () {
            for (const bogus_ref of ['#/components/parameters/something',
                                     '#/components/responses/something',
                                     '#/components/headers/something',
                                     '#/components/examples/something',
                                     '#/components/links/something',
                                     '#/components/callbacks/something'])
                assert.throws(() => {
                    (new oasa_spec(this._min_sample_oasd)).resolve_ref(bogus_ref)
                    console.error(`ref "${bogus_ref}" did not cause throw`);
                });
        });

        it('returns undefined if no components', function () {
            assert.equal((new oasa_spec(this._min_sample_oasd)).resolve_ref('#/components/schemas/anything'), undefined);
        });

        it('returns undefined if no components.component_type', function () {
            this._min_sample_oasd.components = {};
            assert.equal((new oasa_spec(this._min_sample_oasd)).resolve_ref('#/components/schemas/anything'), undefined);
        });

        describe('given schema reference', function () {
            beforeEach(function () {
                this._spec = new oasa_spec({
                    'openapi': '3.0.0',
                    'components': {
                        'schemas': {
                            'exists': {
                                'type': 'object',
                            },
                        },
                    },
                });
            });

            it('returns undefined if it does not exist', function() {
                assert.equal(this._spec.resolve_ref('#/components/schemas/not_here'), undefined);
            });

            it('returns oasa_schema object if it exists', function() {
                assert(this._spec.resolve_ref('#/components/schemas/exists') instanceof oasa_schema);
            });
        });

        describe('given request body reference', function () {
            beforeEach(function () {
                this._spec = new oasa_spec({
                    'openapi': '3.0.0',
                    'components': {
                        'requestBodies': {
                            'exists': {
                                'description': 'requestbody1 request body',
                                'content': {'application/json': {'schema': {'type': 'object'}}},
                            },
                        },
                    },
                });
            });

            it('returns undefined if it does not exist', function() {
                assert.equal(this._spec.resolve_ref('#/components/requestBodies/not_here'), undefined);
            });

            it('returns oasa_schema object if it exists', function() {
                assert(this._spec.resolve_ref('#/components/requestBodies/exists') instanceof oasa_reqbody);
            });
        });

        describe('given security scheme reference', function () {
            beforeEach(function () {
                this._spec = new oasa_spec({
                    'openapi': '3.0.0',
                    'components': {
                        'securitySchemes': {
                            'exists': {
                                'type': 'http',
                                'scheme': 'basic',
                            },
                        },
                    },
                });
            });

            it('returns undefined if it does not exist', function() {
                assert.equal(this._spec.resolve_ref('#/components/securitySchemes/not_here'), undefined);
            });

            it('returns oasa_schema object if it exists', function() {
                assert(this._spec.resolve_ref('#/components/securitySchemes/exists') instanceof oasa_secscheme);
            });
        });
    });

    describe('operations', function () {
        beforeEach(function () {
            this._oasd = {
                'openapi': '3.0.0',
                'paths': {
                    '/path1': {
                        'get': {
                        },
                    },
                },
            };
            this._spec = new oasa_spec(this._oasd);
        });

        it('returns an array', function () {
            assert(this._spec.operations() instanceof Array);
        });

        it('returns an array of oasa_operation objects', function () {
            assert(this._spec.operations().length > 0);

            for (const op of this._spec.operations())
                assert(op instanceof oasa_operation);
        });
    });

    describe('named_operation', function () {
        beforeEach(function () {
            this._oasd = {
                'openapi': '3.0.0',
                'paths': {
                    '/path1': {
                        'get': {
                            'operationId': 'get_it',
                        },
                    },
                },
            };
            this._spec = new oasa_spec(this._oasd);
        });

        it('returns undefined if the specified operation does not exist', function () {
            assert.equal(this._spec.named_operation('noexists'), undefined);
        });

        it('returns an oasa_operation object', function () {
            assert(this._spec.named_operation('get_it') instanceof oasa_operation);
        });

        it('returns the specified operation', function () {
            assert.equal(this._spec.named_operation('get_it').id(), 'get_it');
        });
    });

    describe('make_object', function () {
        beforeEach(function () {
            this._oasd = {
                'openapi': '3.0.0',
                'components': {
                    'schemas': {
                        'some_obj': {'type': 'object', 'properties': {'foo': {'type': 'string'}}},
                        'other_obj': {'type': 'object', 'properties': {'baz': {'type': 'string'}}},
                    },
                },
            };
            this._spec = new oasa_spec(this._oasd);
            this._some_schema = this._spec.resolve_ref('#/components/schemas/some_obj');
            this._other_schema = this._spec.resolve_ref('#/components/schemas/other_obj');
        });

        it('returns object given schema and data', function () {
            assert(this._spec.make_object({'foo': 'bar'}, {'schema': this._some_schema}) instanceof oasa_object);
            assert.equal(this._spec.make_object({'foo': 'bar'}, {'schema': this._some_schema}).schema(), this._some_schema);
            assert.equal(this._spec.make_object({'foo': 'bar'}, {'schema': this._some_schema}).prop('foo'), 'bar');
            assert.equal(this._spec.make_object({'baz': 'bar'}, {'schema': this._some_schema}).prop('baz'), undefined);
        });

        it('returns object given schema ref and data', function () {
            assert(this._spec.make_object({'baz': 'bar'}, {'schema_ref': '#/components/schemas/other_obj'}) instanceof oasa_object);
            assert.deepEqual(this._spec.make_object({'baz': 'bar'}, {'schema_ref': '#/components/schemas/other_obj'}).schema(), this._other_schema);
            assert.equal(this._spec.make_object({'baz': 'bar'}, {'schema_ref': '#/components/schemas/other_obj'}).prop('baz'), 'bar');
            assert.equal(this._spec.make_object({'foo': 'bar'}, {'schema_ref': '#/components/schemas/other_obj'}).prop('foo'), undefined);
        });

        it('returns object given schema ref and data', function () {
            assert(this._spec.make_object({'baz': 'bar'}, {'schema_name': 'other_obj'}) instanceof oasa_object);
            assert.deepEqual(this._spec.make_object({'baz': 'bar'}, {'schema_name': 'other_obj'}).schema(), this._other_schema);
            assert.equal(this._spec.make_object({'baz': 'bar'}, {'schema_name': 'other_obj'}).prop('baz'), 'bar');
            assert.equal(this._spec.make_object({'foo': 'bar'}, {'schema_name': 'other_obj'}).prop('foo'), undefined);
        });
    });
});

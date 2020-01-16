const assert = require('assert');

const oasa_spec     = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_response = require('./../lib/oasa-response.js').oasa_response;
const oasa_content  = require('./../lib/oasa-content.js').oasa_content;


const min_sample_oasd = {
    'openapi': '3.0.0',
};

const success_http_codes     = ['200', '201', '204', '299'];
const failure_http_codes     = ['400', '404', '499', '500', '503', '599'];
const redirection_http_codes = ['300', '301', '399'];


describe('oasa_response', function () {
    beforeEach(function () {
        this._spec = new oasa_spec(min_sample_oasd);
    });

    describe('new', function () {
        it('throws if no spec given', function () {
            assert.throws(() => new oasa_response(undefined, {}, '200'));
        });

        it('throws if no status given', function () {
            assert.throws(() => new oasa_response(this._spec, {}, undefined));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_response(this._spec, undefined, '200'));
        });

        it('given spec, status and operation schema def, returns oasa_response object', function () {
            assert(new oasa_response(this._spec, {}, '200') instanceof oasa_response);
        });
    });

    describe('status', function () {
        it('returns a number', function () {
            let spec = new oasa_spec(min_sample_oasd);
            let op   = new oasa_response(spec, {}, '200');
            assert.equal(typeof op.status(), 'number');
        });

        it('returns the (numeric) status code', function () {
            let spec = new oasa_spec(min_sample_oasd);
            let res  = new oasa_response(spec, {}, '200');
            assert.equal(res.status(), 200);
        });
    });

    describe('descr', function () {
        it('if there is a description, returns a string', function () {
            let spec = new oasa_spec(min_sample_oasd);
            let res  = new oasa_response(spec, {'description': 'the response description'}, '200');
            assert.equal(typeof res.descr(), 'string');
        });

        it('returns the description', function () {
            let spec = new oasa_spec(min_sample_oasd);
            let res  = new oasa_response(spec, {'description': 'the response description'}, '200');
            assert.equal(res.descr(), 'the response description');
        });

        it('if there is not a description, returns undefined', function () {
            let spec = new oasa_spec(min_sample_oasd);
            let res  = new oasa_response(spec, {}, '200');
            assert.equal(res.descr(), undefined);
        });
    });

    describe('content', function () {
        beforeEach(function () {
            this._res_oasd = {
                'content': {'application/json': {'schema': {'type': 'object'}}},
            };
            this._spec = new oasa_spec(min_sample_oasd);
            this._res  = new oasa_response(this._spec, this._res_oasd, '200');
        });

        it('if no content, returns undefined', function () {
            delete this._res_oasd.content;
            this._res  = new oasa_response(this._spec, this._res_oasd, '200');
            assert.equal(this._res.content(), undefined);
        });

        it('returns an oasa_content object', function () {
            assert(this._res.content() instanceof oasa_content);
        });
    });

    describe('success', function () {
        it('returns true for success HTTP codes', function () {
            for (const status of success_http_codes) {
                let res  = new oasa_response(this._spec, {'content': {}}, status);
                assert.equal(res.success(), true);
            }
        });

        it('returns false for failure HTTP codes', function () {
            for (const status of failure_http_codes) {
                let res  = new oasa_response(this._spec, {'content': {}}, status);
                assert.equal(res.success(), false);
            }
        });

        it('returns false for redirection HTTP codes', function () {
            for (const status of redirection_http_codes) {
                let res  = new oasa_response(this._spec, {'content': {}}, status);
                assert.equal(res.success(), false);
            }
        });

        describe('failure', function () {
            it('returns true for failure HTTP codes', function () {
                for (const status of failure_http_codes) {
                    let res  = new oasa_response(this._spec, {'content': {}}, status);
                    assert.equal(res.failure(), true);
                }
            });

            it('returns false for success HTTP codes', function () {
                for (const status of success_http_codes) {
                    let res  = new oasa_response(this._spec, {'content': {}}, status);
                    assert.equal(res.failure(), false);
                }
            });

            it('returns false for redirection HTTP codes', function () {
                for (const status of redirection_http_codes) {
                    let res  = new oasa_response(this._spec, {'content': {}}, status);
                    assert.equal(res.failure(), false);
                }
            });
        });

        describe('redirection', function () {
            it('returns true for redirection HTTP codes', function () {
                for (const status of redirection_http_codes) {
                    let res  = new oasa_response(this._spec, {'content': {}}, status);
                    assert.equal(res.redirection(), true);
                }
            });

            it('returns false for success HTTP codes', function () {
                for (const status of success_http_codes) {
                    let res  = new oasa_response(this._spec, {'content': {}}, status);
                    assert.equal(res.redirection(), false);
                }
            });

            it('returns false for failure HTTP codes', function () {
                for (const status of failure_http_codes) {
                    let res  = new oasa_response(this._spec, {'content': {}}, status);
                    assert.equal(res.redirection(), false);
                }
            });
        });
    });
});

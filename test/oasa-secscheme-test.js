const assert = require('assert');

const oasa_spec      = require('./../lib/oasa-spec.js').oasa_spec;
const oasa_secscheme = require('./../lib/oasa-secscheme.js').oasa_secscheme;


const min_sample_oasd = {
    'openapi': '3.0.0',
};


describe('oasa_response', function () {
    describe('new', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('throws if no spec given', function () {
            assert.throws(() => new oasa_secscheme(undefined, {}, 'secscheme_name', undefined));
        });

        it('throws if no security scheme name given', function () {
            assert.throws(() => new oasa_secscheme(this._spec, {}, undefined, undefined));
        });

        it('throws if no oasd given', function () {
            assert.throws(() => new oasa_secscheme(this._spec, undefined, 'secscheme_name', undefined));
        });

        it('given spec, security scheme name and security scheme def, returns oasa_secscheme object', function () {
            assert(new oasa_secscheme(this._spec, {}, 'secscheme_name', []) instanceof oasa_secscheme);
        });
    });

    describe('name', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
            this._ss = new oasa_secscheme(this._spec, {}, 'secscheme_name', []);
        });

        it('returns a string', function () {
            assert.equal(typeof this._ss.name(), 'string')
        });

        it('returns the security scheme name', function () {
            assert.equal(this._ss.name(), 'secscheme_name')
        });
    });

    describe('name', function () {
        beforeEach(function () {
            this._spec = new oasa_spec(min_sample_oasd);
        });

        it('when no scopes, returns empty array', function () {
            let ss = new oasa_secscheme(this._spec, {}, 'secscheme_name', undefined);
            assert.deepEqual(ss.scopes(), []);
        });

        it('when scopes is empty, returns empty array', function () {
            let ss = new oasa_secscheme(this._spec, {}, 'secscheme_name', []);
            assert.deepEqual(ss.scopes(), []);
        });

        it('returns the security scheme name', function () {
            let ss = new oasa_secscheme(this._spec, {}, 'secscheme_name', ['some_scope']);
            assert.deepEqual(ss.scopes(), ['some_scope']);
        });
    });
});

const assert = require('assert');

const index     = require('./../lib/index.js');
const oasa_spec = require('./../lib/oasa-spec.js').oasa_spec;


describe('exports', function () {
    it('exports oasa_spec', function () {
        assert.equal(index.oasa_spec, oasa_spec);
    })
});

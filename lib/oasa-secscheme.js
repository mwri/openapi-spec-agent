class oasa_secscheme {
    constructor (spec, oasd, name, scopes) {
        if (!spec)
            throw new Error('no spec object (first parameter)');
        if (!oasd)
            throw new Error('no secscheme OpenAPI specification (second parameter)');
        if (!name)
            throw new Error('no secscheme name (third parameter)');

        this._name   = name;
        this._scopes = scopes || [];
    }

    name () {
        return this._name;
    }

    scopes () {
        return this._scopes;
    }
}


module.exports = {
    'oasa_secscheme': oasa_secscheme,
};

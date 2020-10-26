# openapi-spec-agent [![Build Status](https://travis-ci.org/mwri/openapi-spec-agent.svg?branch=master)](https://travis-ci.org/mwri/openapi-spec-agent) [![Coverage Status](https://coveralls.io/repos/github/mwri/openapi-spec-agent/badge.svg?branch=master)](https://coveralls.io/github/mwri/openapi-spec-agent?branch=master)

Parses an OpenAPI 3.0 specification, either for analysing the specification, its
operations, schemas, etc, or for helping to prepare actual HTTP requests for given
operations (see the [oasa_operation](#oasa_operation) request method) and subsuming
response data into objects, or arrays of objects, according to the relevant schema.
References are resolved transparently to present a uniform interface.

## Contents

1. [Contents](#contents).
2. [Quick start](#quick-start).
3. [Classes](#classes).
   1. [oasa_spec](#oasa_spec).
   2. [oasa_operation](#oasa_operation).
   3. [oasa_param](#oasa_param).
   4. [oasa_response](#oasa_response).
   5. [oasa_schema](#oasa_schema).
   6. [oasa_property](#oasa_property).
   7. [oasa_object](#oasa_object).
   8. [oasa_reqbody](#oasa_reqbody).
   9. [oasa_content](#oasa_content).
   10. [oasa_secscheme](#oasa_secscheme).
4. [Build](#build).

## Quick start

Load a YAML file is loaded from the local filesystem, parsed to a structure
and then passed to the openapi-spec-agent spec constructor:

```javascript
const fs        = require('fs');
const js_yaml   = require('js-yaml');
const oasa_spec = require('openapi-spec-agent').oasa_spec;

const spec = new oasa_spec(js_yaml.safeLoad(fs.readFileSync('./some_openapi3_spec.yml')));
```

Now you can call various functions on the `spec` object, fmr example
`servers()` will return a list of the servers, `title()` will return
the spec title and `operations()` will return a list of all the operations.
There is also `resolve_ref()` though it is not particularly useful to use
directly.

The `operations()` call will return a list of `oasa_operation` objects which
support `path()`, `method()`, `id()`, `responses()`, `security()`, `params()`
and many more calls. Each operation is derived from a method and path in the
specification.

It is even possible to use an `oasa_operation` object `request()` call to
prepare an actual request to a server, providing all the required parameters
and getting back a completed URL, request body, etc, appropriately encoded
and ready to use with a HTTP client / user agent.

Note that the same OpenAPI 3 schema specified in different ways (with parts
included directly, or by using a reference for example) but the data returned
by all `openapi-spec-agent` calls will be the same; references are resolved
transparently to make the interface the same regardless.

## Classes

### oasa_spec

The `oasa_spec` class represents the whole specification. There are two
parameters, first and mandatory is the specification, for example you could
load a YAML file, parse it and create the specification like this:

```javascript
const fs        = require('fs');
const js_yaml   = require('js-yaml');
const oasa_spec = require('openapi-spec-agent').oasa_spec;

const spec = new oasa_spec(js_yaml.safeLoad(fs.readFileSync('./some_openapi3_spec.yml')));
```

The second, optional parameter is an options object, with one
option, `debug`, supported. Setting `debug` to `true` will enable some
logging (to the console), or you can set it to a function like this:

```javascript
const spec = new oasa_spec(spec_struct, {
  'debug': function (level, msg) {
    my_log(msg);
  },
});
```

#### Methods

##### servers

Returns an array of URLs of all servers from the speification, an
empty array if there are none.

##### title

Returns the specification title.

##### operations

Returns an array of operations (`oasa_operation` objects).

##### named_operation

Returns the named operation (`oasa_operation` object), or `undefined` if it
does not exist.

```javascript
let op = spec.named_operation('get_the_thing');
```

##### make_object

Creates an `oasa_object` object, from the data, using the specified schema
from the specification. This is useful for creating objects outside of the
context of an actual OpenAPI request, if you come by the data some other
way, for example if an object's data is passed via a websocket, or if you
load the data from the filesystem. Either way, if you want to normalise
back to an `oasa_object` object, use this.

The schema can be passed, or specified by full reference of short name:

```javascript
let obj1 = spec.make_object({'foo': 'bar', 'baz': 'bat'}, {'schema': schema});
let obj2 = spec.make_object({'foo': 'bar', 'baz': 'bat'}, {'schema_ref': '#/components/schemas/obj1'});
let obj3 = spec.make_object({'foo': 'bar', 'baz': 'bat'}, {'schema_name': 'obj2'});
```

##### resolve_ref

Takes a reference (for example *#/components/schemas/Pet*) and
returns an object representing what it points to. Not all references
are supported, currently an `oasa_schema`, `oasa_reqbody` or `oasa_secscheme`
object may be returned. In the case of *#/components/schemas/Pet* this
would obviously be an `oasa_schema` object.

An error is thrown if the reference is malformed or unsupported.

### oasa_operation

The `oasa_operation` class represents an operation. Each operation will be
derived from a path and method in the specification, for example with this
truncated specification, two operations are implicit, a user get and a user
patch (modify) operation.

```yaml
paths:
  /users/{id}:
    get:
      ...
    patch:
      ...
```

#### Methods

##### path

Returns the path of the operation (i.e. '/users/{id}' in the example above).

##### method

Returns the method of the operation ('GET', 'POST', 'PUT', etc).

##### id

Returns the ID of the operation (the *operationId* from the specification)
or `undefined` if there isn't one for the operation.

##### summary

Returns the summary text, or `undefined` if there isn't a summary.

##### tags

Returns an array of tags (strings), an empty array if there are
none.

##### responses

Returns an array of responses (`oasa_response` objects), each being a
possible response for the operation.

##### status_response

Returns the response (`oasa_response` object) for the given status
code, or `undefined` if there isn't one.

```javascript
let res = op.status_operation(200);
```

##### security

Returns an array of security schemes (`oasa_secscheme` objects)
which apply for the operation, an empty array if there are none.

##### req_body

Returns a request body (a `oasa_reqbody` object) for the operation, or
`undefined` if there is none.

##### params

Returns an array of parameters (`oasa_param` objects) supported.

##### request

Takes a server, a set of parameter values, a content type and a
body, and attempts to form a complete request for the operation. The return value
is an object with `method`, `url`, `body`, `headers` and `cookies` keys. In order
to make a request, some HTTP client of choice should be invoked and the method, the
URL, the body, headers and cookies must all be used in the request. Additional
headers and cookies may of course be included as well.

For example:

```javascript
let req_info = dog_eat_op.request(
    'https://some.server/',
    {'id': 'scoobydoo', 'speed': 8},
    'application/json',
    {'food': 'scoobysnack'}
);
```

The `req_info` object `url` may be something like
`https://some.server/api/v1/dogs/scoobydoo/eat?speed=8` with a `method` of `PUT`
and a `body` of `{"food": "scoobysnack"}`. Something like that. The `headers`
value in this case will at least be `{'Content-Type': 'application/json'}` but
if some provided parameters are 'header parameters' then there may be more, and
if no content type is given then it could be simply `{}`. Similarly `cookies`
may minimally be `{}` but given cookie parameters there will be key value pairs
included.

The parameters key value pairs are the name and value of value parameters
for the operation. Unknown/unexpected parameters are ignored.

### oasa_param

The `oasa_param` class represents a parameter (for an operation).

#### Methods

##### name

Returns the name of the parameter.

##### in

Returns `path`, `query` or `header` to indicate if the parameter
is incorporated into a request in the path, query string or headers.

##### descr

Returns the parameter description, or `undefined` if there isn't one.

##### required

Returns boolean `true` if the parameter is mandatory, or `false` otherwise.

##### schema

Returns a schema for the parameter (an `oasa_schema` object).

### oasa_response

The `oasa_response` object represents a possible response for an operation.

#### Methods

##### status

Returns the status code of the response.

##### descr

Returns the response description, or `undefined` if there isn't one.

##### content

Returns the expected content associated with the response (an `oasa_content`
object).

##### success

Returns boolean `true` if it is a successful response.

##### failure

Returns boolean `true` if it is a failure response.

##### redirection

Returns boolean `true` if it is a redirection response.

### oasa_schema

The `oasa_schema` object represents a schema, which might be for a request
body, a response or even for a property.

#### Methods

##### name

Returns the name of the schema, if one is available (schemas will only have
names if they were found by reference, schemas incorporated directly are
annonymous).

##### type

Returns the type of the schema (for example *"object"* or *"string"* or
*"array"*).

##### all_props

Returns a list of all properties in the schema (a list of `oasa_property`
objects).

##### required_props

Returns a list of just the mandatory properties in the schema (a list of
`oasa_property` objects).

##### optional_props

Returns a list of just the optional properties in the schema (a list of
`oasa_property` objects).

##### named_prop

Return a the named property (`oasa_property` object), or `undefined` if
there is no such property.

```javascript
let prop = schema.named_prop('prop_name');
```

##### of

If the schema is an array type, this returns another schema, for the
constituent objects.

If the schema is not an array an error is thrown.

##### interpret

Interpret some data in the context of the schema. What this means is that if
you make an API call which returns some sort of object, and you have a schema
(a `oasa_schema` object) for the response of that API call, then you can pass
the response data to the `interpret` function and it will return an `oasa_object`
object. If the API response is an array of objects, and the schema is an array
of objects too, then `interpret` will return an array of `oasa_object` objects.
See [oasa_object](#oasa_object) later.

Objects, arrays, booleans, numbers and strings are supported types.

Note that interpret is very unforgiving if your schema is incomplete or incorrect!
If data is missing then check the schema, and specified correctly. If you turn
on debug (see [oasa_spec](#oasa_spec)) the logging will inform you that data is
being lost like this. Although this might seem annoying, you don't HAVE to use
interpret; there's nothing stopping you using the raw response, but doing so
keeps you honest, your schema will be better for it, and possibly any other
OpenAPI tooling you use may then work better too.

Schemas without types are, as per the OpenAPI specification, are matchable to
any data, but such data will not be parsed into [oasa_object](#oasa_object)
objects, but is included raw (i.e. the property value may be an `Object`
instead). Of course over use of typeless schemas is a great way of escaping
the above mentioned honesty sadly...

### oasa_property

The `oasa_property` object represents a property (of a request body or response).

#### Methods

##### name

Returns the name of the property.

##### type

Returns the type of the property ('number', 'string', 'integer', etc, any
type allowed in OpenAPI.

##### descr

Returns the property description, or `undefined` if there isn't one.

##### enum

Returns an array of possible values of the property, or undefined if there
is no such set of values.

##### example

Returns the example value, of `undefined` if there isn't one.

##### schema

Returns the schema (an `oasa_schema` object) of the property.

##### read_only

Returns true if the propert is read only, or false otherwise.

### oasa_object

The `oasa_object` object represents an object, actual data exchanged with a
server.

#### Methods

##### prop

Return the value of the named property. For example:

```javascript
let val = obj.prop('path');
```

##### schema

Return the schema of the object.

##### serialise

Return a straight forward serialised version of the object, consisting of objects, arrays
and scalars, no longer an `oasa_object`, suitable for JSON encoding.

### oasa_reqbody

The `oasa_reqbody` object represents a request body.

#### Methods

##### content_types

Return an array of possible content types. For example if the request body may
be either *application/json* or *text/plain* then `['application/json','text/plain']`
will be returned.

##### schema

Return the schema (an `oasa_schema` object) of the request body.

### oasa_content

The `oasa_content` object represents content (either in the context of a request body
or a response).

#### Methods

##### content_types

Return an array of possible content types. For example if the content may
be either *application/json* or *text/plain* then `['application/json','text/plain']`
will be returned.

##### schema

Return the schema (an `oasa_schema` object) for the content.

### oasa_secscheme

#### Methods

##### name

Returns the name of the security scheme.

##### scopes

Returns an array of scopes, an empty array if there are none.

## Build

Run `npm install` to install the dependencies and `npm run test` (or
`npm run coverage`) to run the test suite.

"use strict";

var _templateObject = _taggedTemplateLiteral(["\n ", "\n"], ["\n ", "\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require("apollo-server-express"),
    gql = _require.gql;

var _require2 = require('@graphql/module/user'),
    userTypeDefs = _require2.typeDefs;

var typeDefs = gql(_templateObject, userTypeDefs);

module.exports = typeDefs;
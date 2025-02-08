'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = handleError;

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function handleError(statusCode) {
  var error = new _httpErrors2.default(statusCode);
  error.statusCode = statusCode;
  throw error;
}
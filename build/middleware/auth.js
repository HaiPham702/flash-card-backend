'use strict';

var jwt = require('jsonwebtoken');

module.exports = function (_ref) {
  var req = _ref.req;

  var authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      var token = authHeader.split('Bearer ')[1]; // Lấy token từ header
      if (!token) {
        throw new Error('Authentication token must be in format: Bearer <token>');
      }
      var user = jwt.verify(token, process.env.JWT_SECRET);
      return { user: user }; // ✅ Trả user vào context
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
  return {}; // Không có token thì context rỗng
};
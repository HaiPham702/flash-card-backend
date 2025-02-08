const jwt = require('jsonwebtoken');

module.exports = ({ req }) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split('Bearer ')[1]; // Lấy token từ header
      if (!token) {
        throw new Error('Authentication token must be in format: Bearer <token>');
      }
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return { user }; // ✅ Trả user vào context
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
  return {}; // Không có token thì context rỗng
};
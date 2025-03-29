const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Tất cả routes đều yêu cầu xác thực
router.use(auth);

// Điểm danh sau khi học xong
router.post('/mark', attendanceController.markAttendance);

// Lấy trạng thái điểm danh trong tuần
router.get('/weekly', attendanceController.getWeeklyAttendance);

// Lấy chi tiết điểm danh theo tháng
router.get('/monthly', attendanceController.getMonthlyAttendance);

module.exports = router; 
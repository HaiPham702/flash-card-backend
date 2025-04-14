const Attendance = require('../models/Attendance');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

// Điểm danh sau khi học xong một bộ flashcard
exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kiểm tra xem đã điểm danh trong ngày hôm nay chưa (chỉ theo user)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);


    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return res.status(200).json({ 
        message: 'Bạn đã điểm danh trong ngày hôm nay rồi',
        attendance: existingAttendance 
      });
    }

    // Lưu thời gian điểm danh với giờ hiện tại
    const attendance = new Attendance({
      userId,
      date: new Date(),
      completed: true
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy trạng thái điểm danh trong tuần
exports.getWeeklyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const attendance = await Attendance.find({
      userId,
      date: { $gte: weekStart, $lte: weekEnd }
    }).sort({ date: 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết điểm danh theo tháng
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;
    const date = new Date(year, month - 1, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const attendance = await Attendance.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd }
    }).sort({ date: 1 });

    // Tạo danh sách các ngày trong tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceMap = new Map(
      attendance.map(a => [a.date.getDate(), a])
    );

    const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        attended: attendanceMap.has(day),
        attendance: attendanceMap.get(day) || null
      };
    });

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');
const auth = require('../middleware/auth');

// Webhook endpoint để nhận tin nhắn từ Telegram
router.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        
        // Xử lý tin nhắn
        if (update.message) {
            await telegramService.handleMessage(update.message);
        }
        
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('❌ Lỗi xử lý webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API để gửi thông báo thủ công (có thể dùng cho admin)
router.post('/send-daily-notifications', auth, async (req, res) => {
    try {
        const result = await telegramService.sendDailyNotifications();
        res.json({
            success: true,
            message: 'Đã gửi thông báo hàng ngày',
            result
        });
    } catch (error) {
        console.error('❌ Lỗi gửi thông báo thủ công:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để đồng bộ users từ Telegram Updates
router.post('/sync-users', auth, async (req, res) => {
    try {
        const count = await telegramService.syncUsersFromUpdates();
        res.json({
            success: true,
            message: `Đã đồng bộ ${count} users từ Telegram`,
            syncedUsers: count
        });
    } catch (error) {
        console.error('❌ Lỗi đồng bộ users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để gửi card ngẫu nhiên cho một user cụ thể
router.post('/send-card/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const result = await telegramService.sendRandomCardToUser(chatId);
        
        res.json({
            success: result,
            message: result ? 'Đã gửi card thành công' : 'Gửi card thất bại'
        });
    } catch (error) {
        console.error('❌ Lỗi gửi card thủ công:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để test bot (kiểm tra kết nối)
router.get('/test', auth, async (req, res) => {
    try {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            return res.status(400).json({
                success: false,
                error: 'TELEGRAM_BOT_TOKEN không được cấu hình'
            });
        }

        // Test bằng cách gọi getMe API
        const axios = require('axios');
        const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
        
        if (response.data.ok) {
            res.json({
                success: true,
                message: 'Bot hoạt động bình thường',
                botInfo: response.data.result
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Bot không phản hồi'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi test bot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để lấy thống kê Telegram users
router.get('/stats', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        
        const totalTelegramUsers = await User.countDocuments({
            telegramChatId: { $exists: true, $ne: null }
        });
        
        const enabledNotifications = await User.countDocuments({
            'telegramNotifications.enabled': true
        });
        
        const dailyReminderUsers = await User.countDocuments({
            'telegramNotifications.dailyReminder': true,
            'telegramNotifications.enabled': true
        });

        res.json({
            success: true,
            stats: {
                totalTelegramUsers,
                enabledNotifications,
                dailyReminderUsers
            }
        });
    } catch (error) {
        console.error('❌ Lỗi lấy thống kê:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 
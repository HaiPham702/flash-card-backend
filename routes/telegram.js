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

// API để lấy danh sách users Telegram
router.get('/users', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        
        const users = await User.find({
            telegramChatId: { $exists: true, $ne: null }
        }, {
            name: 1,
            email: 1,
            telegramChatId: 1,
            telegramUsername: 1,
            telegramNotifications: 1,
            createdAt: 1
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để lấy schedule configuration
router.get('/schedule', auth, async (req, res) => {
    try {
        const schedulerService = require('../services/schedulerService');
        const config = schedulerService.getScheduleConfig();
        
        res.json({
            success: true,
            schedule: config
        });
    } catch (error) {
        console.error('❌ Lỗi lấy schedule config:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để cập nhật schedule configuration
router.post('/schedule', auth, async (req, res) => {
    try {
        const { schedules } = req.body;
        
        if (!Array.isArray(schedules)) {
            return res.status(400).json({
                success: false,
                error: 'Schedules phải là một array'
            });
        }

        const schedulerService = require('../services/schedulerService');
        const updated = schedulerService.updateScheduleConfig(schedules);
        
        if (updated) {
            res.json({
                success: true,
                message: 'Đã cập nhật schedule configuration'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Không thể cập nhật schedule'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi cập nhật schedule:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để toggle time slot
router.post('/schedule/toggle', auth, async (req, res) => {
    try {
        const { timeLabel, enabled } = req.body;
        
        if (!timeLabel || typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'timeLabel và enabled là required'
            });
        }

        const schedulerService = require('../services/schedulerService');
        const toggled = schedulerService.toggleTimeSlot(timeLabel, enabled);
        
        if (toggled) {
            res.json({
                success: true,
                message: `Đã ${enabled ? 'bật' : 'tắt'} time slot ${timeLabel}`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Không tìm thấy time slot'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi toggle time slot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để thêm custom time slot
router.post('/schedule/add', auth, async (req, res) => {
    try {
        const { time, label } = req.body;
        
        if (!time || !label) {
            return res.status(400).json({
                success: false,
                error: 'time và label là required'
            });
        }

        const schedulerService = require('../services/schedulerService');
        const added = schedulerService.addCustomTimeSlot(time, label);
        
        if (added) {
            res.json({
                success: true,
                message: `Đã thêm time slot: ${label}`
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Không thể thêm time slot (có thể đã tồn tại hoặc cron expression không hợp lệ)'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi thêm time slot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để xóa time slot
router.delete('/schedule/:timeLabel', auth, async (req, res) => {
    try {
        const { timeLabel } = req.params;
        
        const schedulerService = require('../services/schedulerService');
        const removed = schedulerService.removeTimeSlot(timeLabel);
        
        if (removed) {
            res.json({
                success: true,
                message: `Đã xóa time slot: ${timeLabel}`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Không tìm thấy time slot để xóa'
            });
        }
    } catch (error) {
        console.error('❌ Lỗi xóa time slot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để gửi tin nhắn đến tất cả users hoặc users cụ thể
router.post('/broadcast', auth, async (req, res) => {
    try {
        const { message, userIds, type = 'text' } = req.body;
        
        // if (!message) {
        //     return res.status(400).json({
        //         success: false,
        //         error: 'Message là required'
        //     });
        // }

        const User = require('../models/User');
        let targetUsers;

        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            // Gửi cho users cụ thể
            targetUsers = await User.find({
                telegramChatId: { $in: userIds }
            });
        } else {
            // Gửi cho tất cả users có bật thông báo
            targetUsers = await User.find({
                'telegramNotifications.enabled': true,
                telegramChatId: { $exists: true, $ne: null }
            });
        }

        if (targetUsers.length === 0) {
            return res.json({
                success: true,
                message: 'Không có user nào để gửi',
                result: { success: 0, failed: 0 }
            });
        }

        console.log(`📢 Broadcasting tin nhắn cho ${targetUsers.length} users...`);

        let successCount = 0;
        let failCount = 0;

        // Gửi song song với batch để tránh rate limit
        const batchSize = 5;
        for (let i = 0; i < targetUsers.length; i += batchSize) {
            const batch = targetUsers.slice(i, i + batchSize);
            
            const promises = batch.map(async (user) => {
                try {
                    if (type === 'card') {
                        // Gửi flashcard ngẫu nhiên
                        const sent = await telegramService.sendRandomCardToUser(user.telegramChatId);
                        if (sent) successCount++;
                        else failCount++;
                    } else {
                        // Gửi tin nhắn text custom
                        await telegramService.sendMessage(user.telegramChatId, message);
                        successCount++;
                    }
                    console.log(`✅ Gửi thành công cho ${user.name} (${user.telegramChatId})`);
                } catch (error) {
                    failCount++;
                    console.error(`❌ Lỗi gửi cho ${user.name}:`, error.message);
                }
            });

            await Promise.all(promises);
            
            // Delay giữa các batch
            if (i + batchSize < targetUsers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        res.json({
            success: true,
            message: 'Hoàn thành broadcast',
            result: {
                success: successCount,
                failed: failCount,
                total: targetUsers.length
            }
        });

    } catch (error) {
        console.error('❌ Lỗi broadcast:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API để cập nhật notification settings cho user
router.post('/users/:chatId/settings', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { enabled, dailyReminder, timePreference } = req.body;
        
        const User = require('../models/User');
        const updateData = {};
        
        if (typeof enabled === 'boolean') {
            updateData['telegramNotifications.enabled'] = enabled;
        }
        if (typeof dailyReminder === 'boolean') {
            updateData['telegramNotifications.dailyReminder'] = dailyReminder;
        }
        if (timePreference) {
            updateData['telegramNotifications.timePreference'] = timePreference;
        }

        const user = await User.findOneAndUpdate(
            { telegramChatId: chatId },
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User không tồn tại'
            });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật settings',
            user: {
                name: user.name,
                telegramNotifications: user.telegramNotifications
            }
        });

    } catch (error) {
        console.error('❌ Lỗi cập nhật user settings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 
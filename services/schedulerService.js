const cron = require('node-cron');
const telegramService = require('./telegramService');

class SchedulerService {
    constructor() {
        this.jobs = new Map();
        this.isInitialized = false;
    }

    // Khởi tạo scheduler
    init() {
        if (this.isInitialized) {
            console.log('⚠️ Scheduler đã được khởi tạo trước đó');
            return;
        }

        console.log('🚀 Khởi tạo Telegram Scheduler Service...');

        // Thiết lập multiple cron jobs: 8:30, 10:30, 12:30, 14:30, 16:30
        this.setupMultipleNotificationJobs();

        // Tùy chọn: Cron job test gửi thông báo mỗi 5 phút (để test)
        // Uncomment dòng dưới nếu muốn test
        // this.setupTestJob();

        this.isInitialized = true;
    }

    // Setup multiple notification jobs (cứ 2 tiếng từ 8:30 đến 17:00)
    setupMultipleNotificationJobs() {
        const schedules = [
            { time: '30 8 * * *', label: '8:30 AM' },
            { time: '30 10 * * *', label: '10:30 AM' },
            { time: '30 14 * * *', label: '2:30 PM' },
            { time: '30 16 * * *', label: '4:30 PM' },
            { time: '30 20 * * *', label: '8:30 PM' },
        ];

        schedules.forEach((schedule, index) => {
            const jobName = `notification_${schedule.label.replace(/[:\s]/g, '_')}`;
            
            const job = cron.schedule(schedule.time, async () => {
                console.log(`⏰ Chạy cron job gửi thông báo - ${schedule.label}`);
                
                try {
                    const result = await telegramService.sendDailyNotifications();
                    console.log(`✅ [${schedule.label}] Hoàn thành gửi thông báo: ${result?.success || 0} thành công, ${result?.failed || 0} thất bại`);
                } catch (error) {
                    console.error(`❌ [${schedule.label}] Lỗi trong cron job:`, error);
                }
            }, {
                scheduled: true,
                timezone: "Asia/Ho_Chi_Minh"
            });

            this.jobs.set(jobName, job);
            console.log(`✅ Đã thiết lập cron job: ${schedule.label} (${schedule.time})`);
        });

        console.log(`🎯 Hoàn thành thiết lập ${schedules.length} cron jobs (8:30 AM - 4:30 PM, cứ 2 tiếng)`);
    }

    // Setup job test (gửi thông báo mỗi 5 phút) - chỉ dùng để test
    setupTestJob() {
        console.log('🧪 Thiết lập test job (gửi thông báo mỗi 5 phút)...');
        
        const testJob = cron.schedule('*/5 * * * *', async () => {
            console.log('🧪 TEST: Chạy cron job test - mỗi 5 phút');
            
            try {
                // Chỉ gửi cho 1 user đầu tiên để test
                const User = require('../models/User');
                const testUser = await User.findOne({
                    'telegramNotifications.enabled': true,
                    telegramChatId: { $exists: true, $ne: null }
                });

                if (testUser) {
                    await telegramService.sendRandomCardToUser(testUser.telegramChatId);
                    console.log(`✅ TEST: Gửi thành công cho ${testUser.name}`);
                } else {
                    console.log('📭 TEST: Không có user nào để test');
                }
            } catch (error) {
                console.error('❌ TEST: Lỗi trong test job:', error);
            }
        }, {
            scheduled: false,
            timezone: "Asia/Ho_Chi_Minh"
        });

        this.jobs.set('testNotifications', testJob);
        testJob.start();
        console.log('✅ Đã thiết lập test job (mỗi 5 phút)');
    }

    // Dừng job
    stopJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.stop();
            console.log(`⏹️ Đã dừng job: ${jobName}`);
            return true;
        } else {
            console.log(`⚠️ Không tìm thấy job: ${jobName}`);
            return false;
        }
    }

    // Start job
    startJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.start();
            console.log(`▶️ Đã start job: ${jobName}`);
            return true;
        } else {
            console.log(`⚠️ Không tìm thấy job: ${jobName}`);
            return false;
        }
    }

    // Lấy trạng thái tất cả jobs
    getJobsStatus() {
        const status = {};
        for (const [name, job] of this.jobs) {
            status[name] = {
                running: job.running || false,
                scheduled: job.scheduled || false
            };
        }
        return status;
    }

    // Gửi thông báo ngay lập tức (manual trigger)
    async triggerDailyNotifications() {
        console.log('🔔 Trigger thủ công gửi thông báo hàng ngày...');
        try {
            const result = await telegramService.sendDailyNotifications();
            console.log(`✅ Trigger thành công: ${result?.success || 0} thành công, ${result?.failed || 0} thất bại`);
            return result;
        } catch (error) {
            console.error('❌ Lỗi trigger thủ công:', error);
            throw error;
        }
    }

    // Thiết lập job với thời gian tùy chỉnh
    setupCustomTimeJob(hour, minute) {
        const jobName = `customDaily_${hour}_${minute}`;
        
        // Dừng job cũ nếu có
        this.stopJob('dailyNotifications');
        
        // Tạo job mới
        const customJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
            console.log(`⏰ Chạy cron job gửi thông báo tùy chỉnh - ${hour}:${minute}`);
            
            try {
                const result = await telegramService.sendDailyNotifications();
                console.log(`✅ Hoàn thành gửi thông báo tự động: ${result?.success || 0} thành công, ${result?.failed || 0} thất bại`);
            } catch (error) {
                console.error('❌ Lỗi trong cron job tùy chỉnh:', error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Ho_Chi_Minh"
        });

        this.jobs.set('dailyNotifications', customJob);
        console.log(`✅ Đã thiết lập job mới lúc ${hour}:${minute} (GMT+7)`);
        
        return jobName;
    }

    // Lấy danh sách time slots hiện tại
    getScheduleConfig() {
        const defaultSchedules = [
            { time: '30 8 * * *', label: '8:30 AM', enabled: true },
            { time: '30 10 * * *', label: '10:30 AM', enabled: true },
            { time: '30 12 * * *', label: '12:30 PM', enabled: true },
            { time: '30 14 * * *', label: '2:30 PM', enabled: true },
            { time: '30 16 * * *', label: '4:30 PM', enabled: true }
        ];

        return defaultSchedules.map(schedule => {
            const jobName = `notification_${schedule.label.replace(/[:\s]/g, '_')}`;
            const job = this.jobs.get(jobName);
            
            return {
                ...schedule,
                jobName,
                running: job ? job.running : false,
                scheduled: job ? job.scheduled : false
            };
        });
    }

    // Toggle enable/disable một time slot cụ thể
    toggleTimeSlot(timeLabel, enabled) {
        const jobName = `notification_${timeLabel.replace(/[:\s]/g, '_')}`;
        const job = this.jobs.get(jobName);

        if (!job) {
            console.log(`⚠️ Không tìm thấy job: ${jobName}`);
            return false;
        }

        if (enabled) {
            job.start();
            console.log(`▶️ Đã bật job: ${timeLabel}`);
        } else {
            job.stop();
            console.log(`⏸️ Đã tắt job: ${timeLabel}`);
        }

        return true;
    }

    // Cập nhật toàn bộ schedule config
    updateScheduleConfig(scheduleConfig) {
        console.log('🔄 Cập nhật schedule configuration...');

        // Dừng tất cả jobs hiện tại
        for (const [name, job] of this.jobs) {
            if (name.startsWith('notification_')) {
                job.destroy();
                this.jobs.delete(name);
            }
        }

        // Tạo jobs mới theo config
        scheduleConfig.forEach(schedule => {
            if (schedule.enabled) {
                const jobName = `notification_${schedule.label.replace(/[:\s]/g, '_')}`;
                
                const job = cron.schedule(schedule.time, async () => {
                    console.log(`⏰ Chạy cron job gửi thông báo - ${schedule.label}`);
                    
                    try {
                        const result = await telegramService.sendDailyNotifications();
                        console.log(`✅ [${schedule.label}] Hoàn thành gửi thông báo: ${result?.success || 0} thành công, ${result?.failed || 0} thất bại`);
                    } catch (error) {
                        console.error(`❌ [${schedule.label}] Lỗi trong cron job:`, error);
                    }
                }, {
                    scheduled: true,
                    timezone: "Asia/Ho_Chi_Minh"
                });

                this.jobs.set(jobName, job);
                console.log(`✅ Tạo job mới: ${schedule.label} (${schedule.time})`);
            }
        });

        console.log('🎯 Hoàn thành cập nhật schedule configuration');
        return true;
    }

    // Thêm time slot mới
    addCustomTimeSlot(time, label) {
        const jobName = `notification_${label.replace(/[:\s]/g, '_')}`;
        
        // Kiểm tra xem job đã tồn tại chưa
        if (this.jobs.has(jobName)) {
            console.log(`⚠️ Job đã tồn tại: ${jobName}`);
            return false;
        }

        // Validate cron expression
        if (!cron.validate(time)) {
            console.log(`❌ Cron expression không hợp lệ: ${time}`);
            return false;
        }

        const job = cron.schedule(time, async () => {
            console.log(`⏰ Chạy cron job custom - ${label}`);
            
            try {
                const result = await telegramService.sendDailyNotifications();
                console.log(`✅ [${label}] Hoàn thành gửi thông báo: ${result?.success || 0} thành công, ${result?.failed || 0} thất bại`);
            } catch (error) {
                console.error(`❌ [${label}] Lỗi trong cron job:`, error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Ho_Chi_Minh"
        });

        this.jobs.set(jobName, job);
        console.log(`✅ Đã thêm custom time slot: ${label} (${time})`);
        return true;
    }

    // Xóa time slot
    removeTimeSlot(timeLabel) {
        const jobName = `notification_${timeLabel.replace(/[:\s]/g, '_')}`;
        const job = this.jobs.get(jobName);

        if (job) {
            job.destroy();
            this.jobs.delete(jobName);
            console.log(`🗑️ Đã xóa job: ${timeLabel}`);
            return true;
        } else {
            console.log(`⚠️ Không tìm thấy job để xóa: ${timeLabel}`);
            return false;
        }
    }

    // Cleanup khi shutdown server
    destroy() {
        console.log('🛑 Dừng tất cả scheduled jobs...');
        for (const [name, job] of this.jobs) {
            job.destroy();
            console.log(`✅ Đã cleanup job: ${name}`);
        }
        this.jobs.clear();
        this.isInitialized = false;
    }
}

// Export instance để dùng toàn ứng dụng
module.exports = new SchedulerService(); 
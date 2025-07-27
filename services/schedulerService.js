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

        // Cron job chạy mỗi ngày lúc 8:30 AM
        // Format: giây phút giờ ngày tháng thứ
        // '30 8 * * *' = 8:30 AM mỗi ngày
        const dailyNotificationJob = cron.schedule('30 8 * * *', async () => {
            console.log('⏰ Chạy cron job gửi thông báo hàng ngày - 8:30 AM');
            
            try {
                const result = await telegramService.sendDailyNotifications();
                console.log(`✅ Hoàn thành gửi thông báo tự động: ${result?.success || 0} thành công, ${result?.failed || 0} thất bại`);
            } catch (error) {
                console.error('❌ Lỗi trong cron job gửi thông báo:', error);
            }
        }, {
            scheduled: false, // Chưa start ngay
            timezone: "Asia/Ho_Chi_Minh" // Múi giờ Việt Nam
        });

        // Lưu job để có thể quản lý sau này
        this.jobs.set('dailyNotifications', dailyNotificationJob);

        // Start job
        dailyNotificationJob.start();
        console.log('✅ Đã thiết lập cron job gửi thông báo hàng ngày lúc 8:30 AM (GMT+7)');

        // Tùy chọn: Cron job test gửi thông báo mỗi 5 phút (để test)
        // Uncomment dòng dưới nếu muốn test
        // this.setupTestJob();

        this.isInitialized = true;
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
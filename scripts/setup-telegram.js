#!/usr/bin/env node

/**
 * 🚀 Quick Setup Script cho Telegram Bot
 * 
 * Script này giúp thiết lập nhanh chóng Telegram bot cho Anki Clone
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
    highlight: (msg) => console.log(`${colors.cyan}🔹 ${msg}${colors.reset}`),
    title: (msg) => console.log(`${colors.magenta}${colors.bright}${msg}${colors.reset}`)
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(`${colors.yellow}❓ ${prompt}${colors.reset}`, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function setupTelegramBot() {
    log.title('🤖 THIẾT LẬP TELEGRAM BOT CHO ANKI CLONE');
    console.log('='.repeat(60));
    
    log.info('Script này sẽ giúp bạn thiết lập Telegram bot từ A-Z');
    console.log();

    // Step 1: Hướng dẫn tạo bot
    log.highlight('BƯỚC 1: Tạo Bot với BotFather');
    console.log(`
1. Mở Telegram và tìm kiếm: ${colors.cyan}@BotFather${colors.reset}
2. Gửi lệnh: ${colors.cyan}/newbot${colors.reset}
3. Nhập tên bot (ví dụ: "Anki Clone Bot")
4. Nhập username bot (phải kết thúc bằng "bot", ví dụ: "ankiclone_bot")
5. BotFather sẽ cung cấp Bot Token
`);

    const hasToken = await question('Bạn đã có Bot Token chưa? (y/n): ');
    
    if (hasToken.toLowerCase() !== 'y') {
        log.warning('Vui lòng tạo bot với @BotFather trước khi tiếp tục');
        log.info('Sau khi có token, chạy lại script này');
        process.exit(0);
    }

    // Step 2: Nhập Bot Token
    log.highlight('BƯỚC 2: Cấu hình Bot Token');
    const botToken = await question('Nhập Bot Token (từ @BotFather): ');
    
    if (!botToken || !botToken.includes(':')) {
        log.error('Bot Token không hợp lệ! Format đúng: 123456789:AABBccddeeffgg...');
        process.exit(1);
    }

    // Step 3: Kiểm tra .env file
    log.highlight('BƯỚC 3: Cấu hình Environment Variables');
    
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        log.info('File .env đã tồn tại, sẽ cập nhật...');
    } else {
        log.info('Tạo file .env mới...');
        // Tạo .env cơ bản
        envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/flashcard-app

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server Configuration
PORT=4000
NODE_ENV=development
`;
    }

    // Thêm hoặc cập nhật TELEGRAM_BOT_TOKEN
    if (envContent.includes('TELEGRAM_BOT_TOKEN=')) {
        envContent = envContent.replace(/TELEGRAM_BOT_TOKEN=.*/, `TELEGRAM_BOT_TOKEN=${botToken}`);
        log.info('Cập nhật TELEGRAM_BOT_TOKEN trong .env');
    } else {
        envContent += `\n# Telegram Bot Configuration\nTELEGRAM_BOT_TOKEN=${botToken}\n`;
        log.info('Thêm TELEGRAM_BOT_TOKEN vào .env');
    }

    fs.writeFileSync(envPath, envContent);
    log.success('Đã cấu hình .env file');

    // Step 4: Test Bot Token
    log.highlight('BƯỚC 4: Kiểm tra Bot Token');
    
    try {
        const axios = require('axios');
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
        
        if (response.data.ok) {
            const bot = response.data.result;
            log.success('Bot Token hợp lệ!');
            log.highlight(`Bot Name: ${bot.first_name}`);
            log.highlight(`Username: @${bot.username}`);
            log.highlight(`ID: ${bot.id}`);
        } else {
            log.error('Bot Token không hợp lệ');
            process.exit(1);
        }
    } catch (error) {
        log.error(`Lỗi kiểm tra bot: ${error.message}`);
        process.exit(1);
    }

    // Step 5: Cấu hình Bot Commands
    log.highlight('BƯỚC 5: Cấu hình Bot Commands');
    
    const setupCommands = await question('Cấu hình commands cho bot? (y/n): ');
    
    if (setupCommands.toLowerCase() === 'y') {
        try {
            const axios = require('axios');
            const commands = [
                { command: 'start', description: 'Bắt đầu và đăng ký nhận thông báo' },
                { command: 'card', description: 'Lấy một flashcard ngẫu nhiên' },
                { command: 'stop', description: 'Tắt thông báo hàng ngày' }
            ];

            const response = await axios.post(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
                commands: commands
            });

            if (response.data.ok) {
                log.success('Đã cấu hình commands cho bot');
            } else {
                log.warning('Không thể cấu hình commands, nhưng bot vẫn hoạt động bình thường');
            }
        } catch (error) {
            log.warning('Lỗi cấu hình commands, bỏ qua...');
        }
    }

    // Step 6: Hướng dẫn sử dụng
    log.highlight('BƯỚC 6: Hướng dẫn sử dụng');
    
    console.log(`
🎉 ${colors.green}THIẾT LẬP HOÀN THÀNH!${colors.reset}

${colors.cyan}Để sử dụng bot:${colors.reset}
1. Khởi động server: ${colors.yellow}npm run dev${colors.reset}
2. Mở Telegram và tìm bot: ${colors.yellow}@${response.data?.result?.username || 'your_bot'}${colors.reset}
3. Gửi lệnh: ${colors.yellow}/start${colors.reset}

${colors.cyan}Tính năng của bot:${colors.reset}
✅ Tự động gửi flashcard hàng ngày lúc 8:30 sáng
✅ Lệnh /card để lấy flashcard ngẫu nhiên
✅ Lệnh /stop để tắt thông báo
✅ Tự động đăng ký user khi nhắn tin

${colors.cyan}API quản lý (cần JWT token):${colors.reset}
• GET  /api/telegram/test - Kiểm tra bot
• POST /api/telegram/send-daily-notifications - Gửi thông báo thủ công
• POST /api/telegram/sync-users - Đồng bộ users
• GET  /api/telegram/stats - Xem thống kê

${colors.cyan}Test bot:${colors.reset}
Chạy: ${colors.yellow}node scripts/test-telegram.js${colors.reset}

${colors.cyan}Xem hướng dẫn chi tiết:${colors.reset}
Đọc file: ${colors.yellow}TELEGRAM_BOT_SETUP.md${colors.reset}
`);

    // Step 7: Test ngay
    const testNow = await question('Test bot ngay bây giờ? (y/n): ');
    
    if (testNow.toLowerCase() === 'y') {
        log.info('Khởi động test script...');
        console.log();
        
        try {
            const TelegramTester = require('./test-telegram');
            const tester = new TelegramTester();
            await tester.runInteractiveTest();
        } catch (error) {
            log.error(`Lỗi test: ${error.message}`);
            log.info('Bạn có thể test sau bằng lệnh: node scripts/test-telegram.js');
        }
    }

    log.success('🎉 Thiết lập hoàn tất! Chúc bạn sử dụng bot hiệu quả!');
}

// Main execution
async function main() {
    try {
        await setupTelegramBot();
    } catch (error) {
        log.error(`Lỗi: ${error.message}`);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Check dependencies
function checkDependencies() {
    try {
        require('axios');
        return true;
    } catch (error) {
        log.error('Thiếu dependency axios. Chạy: npm install axios');
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    if (checkDependencies()) {
        main();
    } else {
        process.exit(1);
    }
}

module.exports = { setupTelegramBot }; 
#!/usr/bin/env node

/**
 * 🧪 Script Test Telegram Bot
 * 
 * Script này giúp test các tính năng của Telegram bot:
 * - Kiểm tra bot token
 * - Test gửi tin nhắn
 * - Đồng bộ users
 * - Gửi flashcard ngẫu nhiên
 */

require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

// Colors for console
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
    highlight: (msg) => console.log(`${colors.cyan}🔹 ${msg}${colors.reset}`)
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class TelegramTester {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.baseURL = `https://api.telegram.org/bot${this.botToken}`;
    }

    async checkBotToken() {
        log.info('Kiểm tra Bot Token...');
        
        if (!this.botToken) {
            log.error('TELEGRAM_BOT_TOKEN không được cấu hình trong .env file');
            return false;
        }

        try {
            const response = await axios.get(`${this.baseURL}/getMe`);
            
            if (response.data.ok) {
                log.success('Bot Token hợp lệ!');
                log.highlight(`Bot Name: ${response.data.result.first_name}`);
                log.highlight(`Username: @${response.data.result.username}`);
                log.highlight(`ID: ${response.data.result.id}`);
                return true;
            } else {
                log.error('Bot Token không hợp lệ');
                return false;
            }
        } catch (error) {
            log.error(`Lỗi kiểm tra bot: ${error.message}`);
            return false;
        }
    }

    async getUpdates() {
        log.info('Lấy danh sách tin nhắn gần đây...');
        
        try {
            const response = await axios.get(`${this.baseURL}/getUpdates`);
            
            if (response.data.ok) {
                const updates = response.data.result;
                log.success(`Tìm thấy ${updates.length} tin nhắn`);
                
                if (updates.length > 0) {
                    const users = new Map();
                    updates.forEach(update => {
                        if (update.message && update.message.from) {
                            const user = update.message.from;
                            users.set(user.id, {
                                id: user.id,
                                name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                                username: user.username || 'No username',
                                message: update.message.text || 'No text'
                            });
                        }
                    });

                    log.highlight('Danh sách users đã nhắn bot:');
                    for (const user of users.values()) {
                        console.log(`  👤 ${user.name} (@${user.username}) - ID: ${user.id}`);
                        console.log(`     📝 Tin nhắn: "${user.message}"`);
                    }
                    
                    return Array.from(users.values());
                } else {
                    log.warning('Chưa có ai nhắn tin cho bot');
                    return [];
                }
            } else {
                log.error('Không thể lấy updates');
                return [];
            }
        } catch (error) {
            log.error(`Lỗi lấy updates: ${error.message}`);
            return [];
        }
    }

    async sendTestMessage(chatId, customMessage = null) {
        const message = customMessage || `🧪 **Test Message từ Anki Clone Bot**

⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}

🎯 Đây là tin nhắn test để kiểm tra bot hoạt động bình thường.

✅ Nếu bạn nhận được tin nhắn này, bot đã hoạt động thành công!

📱 Các lệnh có thể dùng:
/start - Bắt đầu 
/card - Lấy flashcard ngẫu nhiên
/stop - Tắt thông báo

🚀 Cảm ơn bạn đã test bot!`;

        try {
            const response = await axios.post(`${this.baseURL}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            });

            if (response.data.ok) {
                log.success(`Gửi tin nhắn test thành công cho chat ID: ${chatId}`);
                return true;
            } else {
                log.error(`Lỗi gửi tin nhắn: ${response.data.description}`);
                return false;
            }
        } catch (error) {
            log.error(`Lỗi gửi tin nhắn: ${error.response?.data?.description || error.message}`);
            return false;
        }
    }

    async connectToDatabase() {
        log.info('Kết nối database...');
        
        try {
            const mongoose = require('mongoose');
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard-app');
            log.success('Kết nối database thành công');
            return true;
        } catch (error) {
            log.error(`Lỗi kết nối database: ${error.message}`);
            return false;
        }
    }

    async testDatabaseIntegration() {
        log.info('Test tích hợp database...');
        
        try {
            const User = require('../models/User');
            const Deck = require('../models/Deck');

            // Count users có telegram
            const telegramUsers = await User.countDocuments({
                telegramChatId: { $exists: true, $ne: null }
            });

            // Count decks có cards
            const decksWithCards = await Deck.countDocuments({
                'cards.0': { $exists: true }
            });

            log.success(`Database Integration:`);
            log.highlight(`  👥 Telegram Users: ${telegramUsers}`);
            log.highlight(`  📚 Decks có cards: ${decksWithCards}`);

            if (decksWithCards === 0) {
                log.warning('Chưa có deck nào có cards. Bot sẽ không thể gửi flashcard!');
                log.info('Hãy tạo một số cards trước khi test bot.');
            }

            return true;
        } catch (error) {
            log.error(`Lỗi test database: ${error.message}`);
            return false;
        }
    }

    async question(prompt) {
        return new Promise((resolve) => {
            rl.question(`${colors.yellow}❓ ${prompt}${colors.reset}`, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async runInteractiveTest() {
        console.log(`${colors.magenta}🚀 TELEGRAM BOT TESTER${colors.reset}`);
        console.log('='.repeat(50));

        // Step 1: Check bot token
        const tokenValid = await this.checkBotToken();
        if (!tokenValid) {
            log.error('Vui lòng cấu hình TELEGRAM_BOT_TOKEN trong .env file');
            process.exit(1);
        }

        // Step 2: Connect database
        const dbConnected = await this.connectToDatabase();
        if (!dbConnected) {
            log.error('Không thể kết nối database');
            process.exit(1);
        }

        // Step 3: Test database integration
        await this.testDatabaseIntegration();

        // Step 4: Get updates
        const users = await this.getUpdates();

        if (users.length === 0) {
            log.warning('Không có user nào. Hãy gửi /start cho bot trước!');
            const botUsername = await this.getBotUsername();
            if (botUsername) {
                log.info(`Hãy mở Telegram và nhắn /start cho @${botUsername}`);
                const waitAnswer = await this.question('Đã nhắn cho bot chưa? (y/n): ');
                if (waitAnswer.toLowerCase() === 'y') {
                    return this.runInteractiveTest(); // Retry
                }
            }
            return;
        }

        // Step 5: Choose user to test
        console.log('\n📋 Chọn user để test:');
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (@${user.username}) - ID: ${user.id}`);
        });

        const choice = await this.question(`Chọn user (1-${users.length}) hoặc 'all' để gửi tất cả: `);

        if (choice.toLowerCase() === 'all') {
            // Send to all users
            log.info('Gửi tin nhắn test cho tất cả users...');
            let successCount = 0;
            
            for (const user of users) {
                const sent = await this.sendTestMessage(user.id);
                if (sent) successCount++;
                await new Promise(r => setTimeout(r, 1000)); // Delay 1s
            }
            
            log.success(`Hoàn thành! Gửi thành công cho ${successCount}/${users.length} users`);
        } else {
            const userIndex = parseInt(choice) - 1;
            if (userIndex >= 0 && userIndex < users.length) {
                const selectedUser = users[userIndex];
                log.info(`Gửi tin nhắn test cho ${selectedUser.name}...`);
                await this.sendTestMessage(selectedUser.id);
            } else {
                log.error('Lựa chọn không hợp lệ');
            }
        }

        // Step 6: Test random card
        const testCard = await this.question('Test gửi flashcard ngẫu nhiên? (y/n): ');
        if (testCard.toLowerCase() === 'y') {
            await this.testRandomCard(users);
        }

        log.success('🎉 Test hoàn thành!');
    }

    async getBotUsername() {
        try {
            const response = await axios.get(`${this.baseURL}/getMe`);
            return response.data.result.username;
        } catch {
            return null;
        }
    }

    async testRandomCard(users) {
        try {
            const telegramService = require('../services/telegramService');
            
            const choice = await this.question(`Gửi flashcard cho user nào? (1-${users.length}) hoặc 'all': `);
            
            if (choice.toLowerCase() === 'all') {
                log.info('Gửi flashcard cho tất cả users...');
                let successCount = 0;
                
                for (const user of users) {
                    const sent = await telegramService.sendRandomCardToUser(user.id);
                    if (sent) successCount++;
                    await new Promise(r => setTimeout(r, 1000));
                }
                
                log.success(`Gửi flashcard thành công cho ${successCount}/${users.length} users`);
            } else {
                const userIndex = parseInt(choice) - 1;
                if (userIndex >= 0 && userIndex < users.length) {
                    const selectedUser = users[userIndex];
                    log.info(`Gửi flashcard cho ${selectedUser.name}...`);
                    const sent = await telegramService.sendRandomCardToUser(selectedUser.id);
                    if (sent) {
                        log.success('Gửi flashcard thành công!');
                    } else {
                        log.error('Gửi flashcard thất bại');
                    }
                }
            }
        } catch (error) {
            log.error(`Lỗi test flashcard: ${error.message}`);
        }
    }
}

// Main execution
async function main() {
    const tester = new TelegramTester();
    
    try {
        await tester.runInteractiveTest();
    } catch (error) {
        log.error(`Lỗi: ${error.message}`);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = TelegramTester; 
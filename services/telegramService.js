const axios = require('axios');
const User = require('../models/User');
const Deck = require('../models/Deck');

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.baseURL = `https://api.telegram.org/bot${this.botToken}`;
        
        if (!this.botToken) {
            console.warn('⚠️ TELEGRAM_BOT_TOKEN not configured');
        }
    }

    // Gửi tin nhắn text
    async sendMessage(chatId, text, options = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/sendMessage`, {
                chat_id: chatId,
                text: text,
                parse_mode: options.parse_mode || 'Markdown',
                ...options
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi gửi tin nhắn Telegram:', error.response?.data || error.message);
            throw error;
        }
    }

    // Gửi ảnh với caption
    async sendPhoto(chatId, photo, caption = '', options = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/sendPhoto`, {
                chat_id: chatId,
                photo: photo,
                caption: caption,
                parse_mode: options.parse_mode || 'Markdown',
                ...options
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi gửi ảnh Telegram:', error.response?.data || error.message);
            throw error;
        }
    }

    // Lấy thông tin cập nhật từ bot (để lấy danh sách user đã nhắn)
    async getUpdates(offset = 0) {
        try {
            const response = await axios.get(`${this.baseURL}/getUpdates`, {
                params: { offset }
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi lấy updates:', error.response?.data || error.message);
            throw error;
        }
    }

    // Đăng ký user từ Telegram
    async registerTelegramUser(chatId, username, firstName, lastName) {
        try {
            // Tìm user theo chatId hoặc tạo mới
            let user = await User.findOne({ telegramChatId: chatId.toString() });
            
            if (!user) {
                // Tạo user mới với thông tin từ Telegram
                user = new User({
                    name: `${firstName || ''} ${lastName || ''}`.trim() || username || `User${chatId}`,
                    email: `telegram_${chatId}@anki.local`, // Email tạm thời
                    password: 'telegram_auth', // Password tạm thời
                    telegramChatId: chatId.toString(),
                    telegramUsername: username,
                    telegramNotifications: {
                        enabled: true,
                        dailyReminder: true,
                        timePreference: '08:30'
                    }
                });
                await user.save();
                console.log(`✅ Đăng ký user Telegram mới: ${user.name} (${chatId})`);
            } else {
                // Cập nhật thông tin nếu user đã tồn tại
                user.telegramUsername = username;
                user.telegramNotifications.enabled = true;
                await user.save();
                console.log(`✅ Cập nhật user Telegram: ${user.name} (${chatId})`);
            }
            
            return user;
        } catch (error) {
            console.error('❌ Lỗi đăng ký user Telegram:', error);
            throw error;
        }
    }

    // Lấy card ngẫu nhiên từ tất cả decks
    async getRandomCard() {
        try {
            const decks = await Deck.aggregate([
                { $match: { 'cards.0': { $exists: true } } }, // Chỉ lấy deck có card
                { $unwind: '$cards' },
                { $sample: { size: 1 } } // Lấy ngẫu nhiên 1 card
            ]);

            if (decks.length === 0) {
                return null;
            }

            const randomDeck = decks[0];
            return {
                deckName: randomDeck.name,
                card: randomDeck.cards
            };
        } catch (error) {
            console.error('❌ Lỗi lấy card ngẫu nhiên:', error);
            return null;
        }
    }

    // Format tin nhắn card
    formatCardMessage(deckName, card) {
        const front = card.front || 'Không có nội dung';
        const back = card.back || 'Không có nội dung';
        const pronunciation = card.pronunciation || '';
        
        let message = `🎴 *Flashcard hôm nay*\n\n`;
        message += `🔤 *${front}*\n\n`;
        message += `💡 *Mặt sau:*\n ${back}\n`;
        
        if (pronunciation) {
            message += `\n🗣️ *Phát âm:* /${pronunciation}/`;
        }
        
        message += `\n\n⏰ Hãy ôn tập và học từ mới mỗi ngày nhé! 📖✨`;
        
        return message;
    }

    // Gửi card ngẫu nhiên cho một user
    async sendRandomCardToUser(chatId) {
        try {
            const cardData = await this.getRandomCard();
            
            if (!cardData) {
                await this.sendMessage(chatId, '😅 Hiện tại chưa có flashcard nào. Hãy tạo một số card trước nhé!');
                return false;
            }

            const message = this.formatCardMessage(cardData.deckName, cardData.card);

            // Nếu có ảnh, gửi ảnh với caption
            if (cardData.card.image) {
                await this.sendPhoto(chatId, cardData.card.image, message);
            } else {
                await this.sendMessage(chatId, message);
            }

            return true;
        } catch (error) {
            console.error(`❌ Lỗi gửi card cho user ${chatId}:`, error);
            await this.sendMessage(chatId, '😅 Có lỗi xảy ra khi gửi flashcard. Vui lòng thử lại sau!');
            return false;
        }
    }

    // Gửi thông báo hàng ngày cho tất cả user
    async sendDailyNotifications() {
        try {
            console.log('🚀 Bắt đầu gửi thông báo hàng ngày...');
            
            // Lấy tất cả user có bật thông báo Telegram
            const users = await User.find({
                'telegramNotifications.enabled': true,
                'telegramNotifications.dailyReminder': true,
                telegramChatId: { $exists: true, $ne: null }
            });

            if (users.length === 0) {
                console.log('📭 Không có user nào đăng ký thông báo');
                return;
            }

            console.log(`📬 Gửi thông báo cho ${users.length} users...`);

            let successCount = 0;
            let failCount = 0;

            // Gửi song song cho tối đa 5 user cùng lúc để tránh rate limit
            const batchSize = 5;
            for (let i = 0; i < users.length; i += batchSize) {
                const batch = users.slice(i, i + batchSize);
                
                const promises = batch.map(async (user) => {
                    try {
                        const sent = await this.sendRandomCardToUser(user.telegramChatId);
                        if (sent) {
                            successCount++;
                            console.log(`✅ Gửi thành công cho ${user.name} (${user.telegramChatId})`);
                        } else {
                            failCount++;
                        }
                    } catch (error) {
                        failCount++;
                        console.error(`❌ Lỗi gửi cho ${user.name}:`, error.message);
                    }
                });

                await Promise.all(promises);
                
                // Delay giữa các batch để tránh rate limit
                if (i + batchSize < users.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`🎉 Hoàn thành gửi thông báo: ${successCount} thành công, ${failCount} thất bại`);
            return { success: successCount, failed: failCount };

        } catch (error) {
            console.error('❌ Lỗi gửi thông báo hàng ngày:', error);
            throw error;
        }
    }

    // Xử lý tin nhắn từ user
    async handleMessage(message) {
        try {
            const chatId = message.chat.id;
            const text = message.text;
            const username = message.from.username;
            const firstName = message.from.first_name;
            const lastName = message.from.last_name;

            // Đăng ký user
            await this.registerTelegramUser(chatId, username, firstName, lastName);

            // Xử lý commands
            if (text.startsWith('/start')) {
                const welcomeMessage = `🎉 *Chào mừng bạn đến với Anki Clone!*\n\n` +
                    `🔔 Bạn đã đăng ký nhận thông báo flashcard hàng ngày lúc 8:30 sáng.\n\n` +
                    `📝 *Các lệnh có thể sử dụng:*\n` +
                    `/card - Lấy một flashcard ngẫu nhiên\n` +
                    `/stop - Tắt thông báo hàng ngày\n` +
                    `/start - Bật lại thông báo\n\n` +
                    `💡 Hãy học từ mới mỗi ngày để nâng cao vốn từ vựng nhé! 🚀`;
                
                await this.sendMessage(chatId, welcomeMessage);
                
            } else if (text.startsWith('/card')) {
                await this.sendRandomCardToUser(chatId);
                
            } else if (text.startsWith('/stop')) {
                await User.updateOne(
                    { telegramChatId: chatId.toString() },
                    { 'telegramNotifications.enabled': false }
                );
                await this.sendMessage(chatId, '🔕 Đã tắt thông báo hàng ngày. Gửi /start để bật lại.');
                
            } else {
                await this.sendMessage(chatId, 
                    '🤖 Xin chào! Gửi /card để lấy flashcard ngẫu nhiên, hoặc /start để xem hướng dẫn.');
            }

        } catch (error) {
            console.error('❌ Lỗi xử lý tin nhắn:', error);
        }
    }

    // Sync tất cả user từ getUpdates API
    async syncUsersFromUpdates() {
        try {
            console.log('🔄 Đồng bộ users từ Telegram Updates...');
            
            const updates = await this.getUpdates();
            const users = new Map(); // Dùng Map để tránh trùng lặp
            
            if (updates.ok && updates.result) {
                updates.result.forEach(update => {
                    if (update.message && update.message.from) {
                        const user = update.message.from;
                        users.set(user.id, {
                            chatId: user.id,
                            username: user.username,
                            firstName: user.first_name,
                            lastName: user.last_name
                        });
                    }
                });
            }

            console.log(`📊 Tìm thấy ${users.size} users từ updates`);
            
            // Đăng ký tất cả users
            let registeredCount = 0;
            for (const userData of users.values()) {
                try {
                    await this.registerTelegramUser(
                        userData.chatId,
                        userData.username,
                        userData.firstName,
                        userData.lastName
                    );
                    registeredCount++;
                } catch (error) {
                    console.error(`❌ Lỗi đăng ký user ${userData.chatId}:`, error.message);
                }
            }

            console.log(`✅ Đã đồng bộ ${registeredCount} users`);
            return registeredCount;

        } catch (error) {
            console.error('❌ Lỗi đồng bộ users:', error);
            throw error;
        }
    }
}

module.exports = new TelegramService(); 
const axios = require('axios');
require('dotenv').config();

class MessengerSetup {
    constructor() {
        this.PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
        this.GRAPH_API_VERSION = 'v17.0';
        this.GRAPH_API_BASE = `https://graph.facebook.com/${this.GRAPH_API_VERSION}`;
    }

    // Cấu hình Get Started Button
    async setupGetStartedButton() {
        console.log('🔄 Đang cấu hình Get Started Button...');
        
        try {
            const data = {
                get_started: { payload: 'GET_STARTED' }
            };

            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messenger_profile?access_token=${this.PAGE_ACCESS_TOKEN}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Get Started Button đã được cấu hình thành công!');
            return response.data;

        } catch (error) {
            console.error('❌ Lỗi cấu hình Get Started Button:', error.response?.data || error.message);
            throw error;
        }
    }

    // Cấu hình Persistent Menu
    async setupPersistentMenu() {
        console.log('🔄 Đang cấu hình Persistent Menu...');
        
        try {
            const data = {
                persistent_menu: [
                    {
                        locale: 'default',
                        composer_input_disabled: false,
                        call_to_actions: [
                            {
                                type: 'postback',
                                title: '📚 Flashcard',
                                payload: 'FLASHCARD'
                            },
                            {
                                type: 'postback',
                                title: '📝 Grammar',
                                payload: 'GRAMMAR'
                            },
                            {
                                type: 'postback',
                                title: '🗣️ Speaking',
                                payload: 'SPEAKING'
                            }
                        ]
                    }
                ]
            };

            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messenger_profile?access_token=${this.PAGE_ACCESS_TOKEN}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Persistent Menu đã được cấu hình thành công!');
            return response.data;

        } catch (error) {
            console.error('❌ Lỗi cấu hình Persistent Menu:', error.response?.data || error.message);
            throw error;
        }
    }

    // Lấy thông tin page
    async getPageInfo() {
        console.log('🔄 Đang lấy thông tin page...');
        
        try {
            const response = await axios.get(
                `${this.GRAPH_API_BASE}/me?fields=id,name,access_token&access_token=${this.PAGE_ACCESS_TOKEN}`
            );

            console.log('✅ Thông tin page:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Lỗi lấy thông tin page:', error.response?.data || error.message);
            throw error;
        }
    }

    // Test gửi tin nhắn
    async testSendMessage(recipientId, messageText = 'Test message from setup script') {
        console.log(`🔄 Đang test gửi tin nhắn đến ${recipientId}...`);
        
        try {
            const messageData = {
                recipient: { id: recipientId },
                message: { text: messageText }
            };

            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messages?access_token=${this.PAGE_ACCESS_TOKEN}`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Tin nhắn test đã được gửi thành công!');
            return response.data;

        } catch (error) {
            console.error('❌ Lỗi gửi tin nhắn test:', error.response?.data || error.message);
            throw error;
        }
    }

    // Setup tất cả
    async setupAll() {
        console.log('🚀 Bắt đầu setup Messenger...\n');

        if (!this.PAGE_ACCESS_TOKEN) {
            console.error('❌ PAGE_ACCESS_TOKEN chưa được cấu hình trong .env file');
            return;
        }

        try {
            // Lấy thông tin page
            await this.getPageInfo();
            console.log('');

            // Setup Get Started Button
            await this.setupGetStartedButton();
            console.log('');

            // Setup Persistent Menu
            await this.setupPersistentMenu();
            console.log('');

            console.log('🎉 Setup Messenger hoàn tất!');
            console.log('\n📋 Các bước tiếp theo:');
            console.log('1. Cấu hình webhook URL trên Facebook Developers');
            console.log('2. Test webhook với ngrok hoặc domain thật');
            console.log('3. Subscribe page to webhook');

        } catch (error) {
            console.error('❌ Setup thất bại:', error.message);
        }
    }
}

// Chạy script
async function main() {
    const setup = new MessengerSetup();
    
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'get-started':
            await setup.setupGetStartedButton();
            break;
        case 'persistent-menu':
            await setup.setupPersistentMenu();
            break;
        case 'page-info':
            await setup.getPageInfo();
            break;
        case 'test-message':
            const recipientId = args[1];
            const messageText = args[2] || 'Test message from setup script';
            if (!recipientId) {
                console.error('❌ Vui lòng cung cấp recipient ID');
                console.log('Usage: node setup-messenger.js test-message <recipient_id> [message_text]');
                return;
            }
            await setup.testSendMessage(recipientId, messageText);
            break;
        case 'all':
        default:
            await setup.setupAll();
            break;
    }
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MessengerSetup; 
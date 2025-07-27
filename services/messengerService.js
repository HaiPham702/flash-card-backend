const axios = require('axios');

class MessengerService {
    constructor() {
        this.PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
        this.GRAPH_API_VERSION = 'v17.0';
        this.GRAPH_API_BASE = `https://graph.facebook.com/${this.GRAPH_API_VERSION}`;
    }

    // Gửi tin nhắn văn bản
    async sendTextMessage(recipientId, messageText) {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        const messageData = {
            recipient: { id: recipientId },
            message: { text: messageText }
        };

        try {
            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messages?access_token=${this.PAGE_ACCESS_TOKEN}`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Tin nhắn đã được gửi thành công:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error.response?.data || error.message);
            throw error;
        }
    }

    // Gửi tin nhắn với quick replies
    async sendQuickReplies(recipientId, messageText, quickReplies) {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        const messageData = {
            recipient: { id: recipientId },
            message: {
                text: messageText,
                quick_replies: quickReplies
            }
        };

        try {
            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messages?access_token=${this.PAGE_ACCESS_TOKEN}`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Quick replies đã được gửi thành công:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi gửi quick replies:', error.response?.data || error.message);
            throw error;
        }
    }

    // Gửi tin nhắn với buttons
    async sendButtonMessage(recipientId, messageText, buttons) {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        const messageData = {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text: messageText,
                        buttons: buttons
                    }
                }
            }
        };

        try {
            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messages?access_token=${this.PAGE_ACCESS_TOKEN}`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Button message đã được gửi thành công:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi gửi button message:', error.response?.data || error.message);
            throw error;
        }
    }

    // Gửi tin nhắn với generic template
    async sendGenericTemplate(recipientId, elements) {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        const messageData = {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: elements
                    }
                }
            }
        };

        try {
            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messages?access_token=${this.PAGE_ACCESS_TOKEN}`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Generic template đã được gửi thành công:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi gửi generic template:', error.response?.data || error.message);
            throw error;
        }
    }

    // Cấu hình Get Started Button
    async setGetStartedButton(payload = 'GET_STARTED') {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        const data = {
            get_started: { payload }
        };

        try {
            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messenger_profile?access_token=${this.PAGE_ACCESS_TOKEN}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Get Started Button đã được cấu hình:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi cấu hình Get Started Button:', error.response?.data || error.message);
            throw error;
        }
    }

    // Cấu hình Persistent Menu
    async setPersistentMenu(menuItems) {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        const data = {
            persistent_menu: [
                {
                    locale: 'default',
                    composer_input_disabled: false,
                    call_to_actions: menuItems
                }
            ]
        };

        try {
            const response = await axios.post(
                `${this.GRAPH_API_BASE}/me/messenger_profile?access_token=${this.PAGE_ACCESS_TOKEN}`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Persistent Menu đã được cấu hình:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi cấu hình Persistent Menu:', error.response?.data || error.message);
            throw error;
        }
    }

    // Lấy thông tin user
    async getUserInfo(userId) {
        if (!this.PAGE_ACCESS_TOKEN) {
            throw new Error('PAGE_ACCESS_TOKEN chưa được cấu hình');
        }

        try {
            const response = await axios.get(
                `${this.GRAPH_API_BASE}/${userId}?fields=first_name,last_name,profile_pic&access_token=${this.PAGE_ACCESS_TOKEN}`
            );

            console.log('Thông tin user:', response.data);
            return response.data;

        } catch (error) {
            console.error('Lỗi lấy thông tin user:', error.response?.data || error.message);
            throw error;
        }
    }

    // Xử lý tin nhắn dựa trên nội dung
    async handleIncomingMessage(senderId, messageText) {
        try {
            let responseText = '';
            let quickReplies = null;

            const lowerMessage = messageText.toLowerCase();

            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                responseText = 'Xin chào! Tôi là bot hỗ trợ học tập. Bạn có thể chọn một trong các tùy chọn sau:';
                quickReplies = [
                    {
                        content_type: 'text',
                        title: '📚 Flashcard',
                        payload: 'FLASHCARD'
                    },
                    {
                        content_type: 'text',
                        title: '📝 Grammar',
                        payload: 'GRAMMAR'
                    },
                    {
                        content_type: 'text',
                        title: '🗣️ Speaking',
                        payload: 'SPEAKING'
                    },
                    {
                        content_type: 'text',
                        title: '❓ Help',
                        payload: 'HELP'
                    }
                ];
            } else if (lowerMessage.includes('flashcard')) {
                responseText = '📚 **Chức năng Flashcard**\n\nHọc từ vựng qua hệ thống thẻ thông minh:\n• Ôn tập theo thuật toán spaced repetition\n• Theo dõi tiến độ học tập\n• Tùy chỉnh bộ thẻ theo nhu cầu\n\nĐể sử dụng đầy đủ tính năng, vui lòng truy cập ứng dụng web của chúng tôi!';
            } else if (lowerMessage.includes('grammar')) {
                responseText = '📝 **Chức năng Grammar**\n\nLuyện tập ngữ pháp tiếng Anh:\n• Bài tập đa dạng theo chủ đề\n• Giải thích chi tiết\n• Theo dõi điểm số\n• Luyện tập theo cấp độ\n\nĐể sử dụng đầy đủ tính năng, vui lòng truy cập ứng dụng web của chúng tôi!';
            } else if (lowerMessage.includes('speaking')) {
                responseText = '🗣️ **Chức năng Speaking**\n\nLuyện nói tiếng Anh:\n• Chủ đề đa dạng\n• Ghi âm và đánh giá\n• Phản hồi từ AI\n• Theo dõi tiến độ\n\nĐể sử dụng đầy đủ tính năng, vui lòng truy cập ứng dụng web của chúng tôi!';
            } else if (lowerMessage.includes('help')) {
                responseText = '❓ **Hướng dẫn sử dụng**\n\n1. 📚 **Flashcard**: Học từ vựng qua thẻ\n2. 📝 **Grammar**: Luyện tập ngữ pháp\n3. 🗣️ **Speaking**: Luyện nói tiếng Anh\n4. ✍️ **Writing**: Viết và được đánh giá\n\nĐể sử dụng đầy đủ tính năng, vui lòng truy cập ứng dụng web của chúng tôi.\n\nBạn cũng có thể gõ:\n• "hello" để xem menu chính\n• "flashcard" để tìm hiểu về flashcard\n• "grammar" để tìm hiểu về ngữ pháp\n• "speaking" để tìm hiểu về luyện nói';
            } else {
                responseText = 'Cảm ơn bạn đã nhắn tin! Tôi đang học để hiểu rõ hơn về yêu cầu của bạn.\n\nBạn có thể gõ "help" để xem hướng dẫn sử dụng hoặc "hello" để xem menu chính.';
            }

            if (quickReplies) {
                await this.sendQuickReplies(senderId, responseText, quickReplies);
            } else {
                await this.sendTextMessage(senderId, responseText);
            }

        } catch (error) {
            console.error('Lỗi xử lý tin nhắn:', error);
            await this.sendTextMessage(senderId, 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }

    // Xử lý postback
    async handlePostback(senderId, payload, title) {
        try {
            let responseText = '';

            switch (payload) {
                case 'GET_STARTED':
                    responseText = '🎉 Chào mừng bạn đến với ứng dụng học tập!\n\nTôi có thể giúp bạn:\n• Học từ vựng qua flashcard\n• Luyện tập ngữ pháp\n• Luyện nói tiếng Anh\n• Viết và được đánh giá\n\nGõ "help" để xem hướng dẫn chi tiết!';
                    break;
                case 'FLASHCARD':
                    responseText = '📚 **Flashcard**\n\nHọc từ vựng hiệu quả với:\n• Thuật toán spaced repetition\n• Theo dõi tiến độ\n• Bộ thẻ tùy chỉnh\n\nTruy cập ứng dụng web để bắt đầu học ngay!';
                    break;
                case 'GRAMMAR':
                    responseText = '📝 **Grammar Practice**\n\nLuyện tập ngữ pháp với:\n• Bài tập đa dạng\n• Giải thích chi tiết\n• Theo dõi điểm số\n\nTruy cập ứng dụng web để bắt đầu luyện tập!';
                    break;
                case 'SPEAKING':
                    responseText = '🗣️ **Speaking Practice**\n\nLuyện nói tiếng Anh với:\n• Chủ đề đa dạng\n• Ghi âm và đánh giá\n• Phản hồi từ AI\n\nTruy cập ứng dụng web để bắt đầu luyện nói!';
                    break;
                case 'HELP':
                    responseText = '❓ **Hướng dẫn sử dụng**\n\n1. 📚 **Flashcard**: Học từ vựng qua thẻ\n2. 📝 **Grammar**: Luyện tập ngữ pháp\n3. 🗣️ **Speaking**: Luyện nói tiếng Anh\n4. ✍️ **Writing**: Viết và được đánh giá\n\nĐể sử dụng đầy đủ tính năng, vui lòng truy cập ứng dụng web của chúng tôi.';
                    break;
                default:
                    responseText = 'Cảm ơn bạn đã tương tác! Bạn có thể gõ "help" để xem hướng dẫn sử dụng.';
            }

            await this.sendTextMessage(senderId, responseText);

        } catch (error) {
            console.error('Lỗi xử lý postback:', error);
            await this.sendTextMessage(senderId, 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    }
}

module.exports = new MessengerService(); 
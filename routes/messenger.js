const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const messengerService = require('../services/messengerService');

// Cấu hình Messenger
const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN || "your_verify_token";
const APP_SECRET = process.env.MESSENGER_APP_SECRET;

// Middleware để xác thực chữ ký webhook
function verifyRequestSignature(req, res, buf) {
    if (!APP_SECRET) {
        console.warn('APP_SECRET not configured. Skipping signature verification.');
        return;
    }

    const signature = req.headers["x-hub-signature-256"];

    if (!signature) {
        console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
        throw new Error("No signature found in request headers.");
    } else {
        const elements = signature.split("=");
        if (elements.length !== 2 || elements[0] !== 'sha256') {
            throw new Error("Invalid signature format.");
        }
        
        const signatureHash = elements[1];
        const expectedHash = crypto
            .createHmac("sha256", APP_SECRET)
            .update(buf)
            .digest("hex");
        
        if (signatureHash !== expectedHash) {
            console.error('Signature mismatch:', { 
                received: signatureHash, 
                expected: expectedHash,
                bodyLength: buf.length 
            });
            throw new Error("Couldn't validate the request signature.");
        }
        
        console.log('✅ Webhook signature verified successfully');
    }
}

// Xác minh webhook - theo chuẩn Meta
router.get('/webhook', (req, res) => {
    // Parse the query params
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Webhook verification request:', { mode, token, challenge });

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Respond with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            console.log('Webhook verification failed - invalid token');
            res.sendStatus(403);
        }
    } else {
        console.log('Webhook verification failed - missing mode or token');
        res.sendStatus(403);
    }
});

// Nhận thông báo sự kiện từ Meta - theo chuẩn Meta Webhooks
router.post('/webhook', (req, res) => {
    try {
        // Xác thực chữ ký webhook nếu có APP_SECRET
        // Note: Trong production, nên enable signature verification
        // if (APP_SECRET) {
        //     verifyRequestSignature(req, res, req.rawBody || JSON.stringify(req.body));
        // }

        const body = req.body;

        console.log(`🟪 Received webhook:`);
        console.dir(body, { depth: null });

        // Send a 200 OK response if this is a page webhook
        if (body.object === 'page') {
            // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
            body.entry.forEach(entry => {
                // Get the webhook event. entry.messaging is an array, but 
                // will only ever contain one message, so we get index 0
                const webhookEvent = entry.messaging[0];
                console.log('Webhook event:', webhookEvent);

                // Get the sender PSID
                const senderPsid = webhookEvent.sender.id;
                console.log('Sender PSID: ' + senderPsid);

                // Check if the event is a message or postback and
                // pass the event to the appropriate handler function
                if (webhookEvent.message) {
                    handleMessage(senderPsid, webhookEvent.message);
                } else if (webhookEvent.postback) {
                    handlePostback(senderPsid, webhookEvent.postback);
                } else if (webhookEvent.delivery) {
                    handleDelivery(senderPsid, webhookEvent.delivery);
                } else if (webhookEvent.read) {
                    handleRead(senderPsid, webhookEvent.read);
                } else if (webhookEvent.account_linking) {
                    handleAccountLinking(senderPsid, webhookEvent.account_linking);
                } else if (webhookEvent.optin) {
                    handleOptin(senderPsid, webhookEvent.optin);
                } else if (webhookEvent.referral) {
                    handleReferral(senderPsid, webhookEvent.referral);
                }
            });

            // Returns a '200 OK' response to all requests
            res.status(200).send('EVENT_RECEIVED');
        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Xử lý tin nhắn nhận được
async function handleMessage(senderPsid, receivedMessage) {
    console.log('Message received from:', senderPsid, 'Message:', receivedMessage);

    try {
        // Check if the message contains text
        if (receivedMessage.text) {
            const messageText = receivedMessage.text;
            console.log(`📩 Tin nhắn từ ${senderPsid}: ${messageText}`);
            
            // Handle message using service
            await messengerService.handleIncomingMessage(senderPsid, messageText);
        } else if (receivedMessage.attachments) {
            // Handle attachments
            console.log('📎 Received attachments from:', senderPsid);
            await messengerService.sendTextMessage(
                senderPsid, 
                'Cảm ơn bạn đã gửi file đính kèm! Hiện tại tôi chỉ có thể xử lý tin nhắn văn bản. Bạn có thể gõ "help" để xem hướng dẫn.'
            );
        } else if (receivedMessage.quick_reply) {
            // Handle quick reply
            const payload = receivedMessage.quick_reply.payload;
            console.log(`⚡ Quick reply từ ${senderPsid}: ${payload}`);
            await messengerService.handlePostback(senderPsid, payload, '');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        await messengerService.sendTextMessage(
            senderPsid,
            'Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.'
        );
    }
}

// Xử lý postback
async function handlePostback(senderPsid, receivedPostback) {
    console.log('Postback received from:', senderPsid, 'Postback:', receivedPostback);

    try {
        const payload = receivedPostback.payload;
        const title = receivedPostback.title;
        
        console.log(`🔄 Postback từ ${senderPsid}: ${payload} - ${title}`);
        
        // Handle postback using service
        await messengerService.handlePostback(senderPsid, payload, title);
    } catch (error) {
        console.error('Error handling postback:', error);
        await messengerService.sendTextMessage(
            senderPsid,
            'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.'
        );
    }
}

// Xử lý delivery receipts
function handleDelivery(senderPsid, delivery) {
    console.log('📨 Message delivery receipt from:', senderPsid, 'Delivery:', delivery);
    
    // Log delivery details
    const messageIds = delivery.mids;
    const watermark = delivery.watermark;
    
    if (messageIds) {
        messageIds.forEach(messageId => {
            console.log(`Message ${messageId} was delivered at ${new Date(watermark).toISOString()}`);
        });
    }
}

// Xử lý read receipts
function handleRead(senderPsid, read) {
    console.log('👁️ Message read receipt from:', senderPsid, 'Read:', read);
    
    // Log read details
    const watermark = read.watermark;
    console.log(`All messages sent before ${new Date(watermark).toISOString()} were read`);
}

// Xử lý account linking
async function handleAccountLinking(senderPsid, accountLinking) {
    console.log('🔗 Account linking from:', senderPsid, 'Account linking:', accountLinking);
    
    const status = accountLinking.status;
    const authorizationCode = accountLinking.authorization_code;
    
    if (status === 'linked') {
        console.log(`User ${senderPsid} linked account with code: ${authorizationCode}`);
        await messengerService.sendTextMessage(
            senderPsid,
            'Tài khoản của bạn đã được liên kết thành công!'
        );
    } else if (status === 'unlinked') {
        console.log(`User ${senderPsid} unlinked account`);
        await messengerService.sendTextMessage(
            senderPsid,
            'Tài khoản của bạn đã được hủy liên kết.'
        );
    }
}

// Xử lý opt-in
async function handleOptin(senderPsid, optin) {
    console.log('✅ Opt-in from:', senderPsid, 'Opt-in:', optin);
    
    const ref = optin.ref;
    console.log(`User ${senderPsid} opted in with ref: ${ref}`);
    
    await messengerService.sendTextMessage(
        senderPsid,
        'Cảm ơn bạn đã đăng ký nhận thông báo từ chúng tôi!'
    );
}

// Xử lý referral
async function handleReferral(senderPsid, referral) {
    console.log('🔗 Referral from:', senderPsid, 'Referral:', referral);
    
    const ref = referral.ref;
    const source = referral.source;
    const type = referral.type;
    
    console.log(`User ${senderPsid} came from ${source} with ref: ${ref} and type: ${type}`);
    
    await messengerService.sendTextMessage(
        senderPsid,
        `Chào mừng bạn đến từ ${source}! Tôi có thể giúp gì cho bạn?`
    );
}



// API để gửi tin nhắn từ server (có thể sử dụng cho admin)
router.post('/send-message', async (req, res) => {
    try {
        const { recipientId, messageText } = req.body;

        if (!recipientId || !messageText) {
            return res.status(400).json({ error: 'recipientId và messageText là bắt buộc' });
        }

        const result = await messengerService.sendTextMessage(recipientId, messageText);
        res.json({ success: true, data: result });

    } catch (error) {
        console.error('Lỗi API send-message:', error);
        res.status(500).json({ error: 'Lỗi gửi tin nhắn' });
    }
});

// API để lấy thông tin webhook
router.get('/webhook-info', (req, res) => {
    res.json({
        webhook_url: `${req.protocol}://${req.get('host')}/api/messenger/webhook`,
        verify_token: VERIFY_TOKEN ? 'Đã cấu hình' : 'Chưa cấu hình',
        page_access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN ? 'Đã cấu hình' : 'Chưa cấu hình',
        app_secret: APP_SECRET ? 'Đã cấu hình' : 'Chưa cấu hình',
        supported_events: [
            'messages',
            'messaging_postbacks', 
            'message_deliveries',
            'message_reads',
            'messaging_account_linking',
            'messaging_optins',
            'messaging_referrals'
        ]
    });
});

// API để test webhook verification (theo chuẩn Meta)
router.get('/test-verification', (req, res) => {
    const testUrl = `${req.protocol}://${req.get('host')}/api/messenger/webhook?hub.verify_token=${VERIFY_TOKEN}&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe`;
    
    res.json({
        message: 'Test webhook verification',
        test_url: testUrl,
        instructions: [
            'Sử dụng curl để test:',
            `curl -X GET "${testUrl}"`,
            'Nếu thành công, bạn sẽ thấy "CHALLENGE_ACCEPTED" và "WEBHOOK_VERIFIED" trong logs'
        ]
    });
});

// API để test webhook event (theo chuẩn Meta)
router.post('/test-webhook', (req, res) => {
    const testPayload = {
        object: "page",
        entry: [
            {
                id: "PAGE_ID",
                time: Date.now(),
                messaging: [
                    {
                        sender: { id: "TEST_USER_ID" },
                        recipient: { id: "PAGE_ID" },
                        timestamp: Date.now(),
                        message: {
                            mid: "test_message_id",
                            text: "TEST_MESSAGE"
                        }
                    }
                ]
            }
        ]
    };

    res.json({
        message: 'Test webhook event',
        test_payload: testPayload,
        instructions: [
            'Sử dụng curl để test:',
            `curl -H "Content-Type: application/json" -X POST "${req.protocol}://${req.get('host')}/api/messenger/webhook" -d '${JSON.stringify(testPayload)}'`,
            'Nếu thành công, bạn sẽ thấy "EVENT_RECEIVED" và logs xử lý trong console'
        ]
    });
});

// API để cấu hình Get Started Button
router.post('/setup-get-started', async (req, res) => {
    try {
        const { payload = 'GET_STARTED' } = req.body;
        const result = await messengerService.setGetStartedButton(payload);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Lỗi cấu hình Get Started Button:', error);
        res.status(500).json({ error: 'Lỗi cấu hình Get Started Button' });
    }
});

// API để cấu hình Persistent Menu
router.post('/setup-persistent-menu', async (req, res) => {
    try {
        const { menuItems } = req.body;
        
        if (!menuItems || !Array.isArray(menuItems)) {
            return res.status(400).json({ error: 'menuItems phải là một mảng' });
        }

        const result = await messengerService.setPersistentMenu(menuItems);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Lỗi cấu hình Persistent Menu:', error);
        res.status(500).json({ error: 'Lỗi cấu hình Persistent Menu' });
    }
});

// API để lấy thông tin user
router.get('/user-info/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userInfo = await messengerService.getUserInfo(userId);
        res.json({ success: true, data: userInfo });
    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        res.status(500).json({ error: 'Lỗi lấy thông tin user' });
    }
});

// API để gửi quick replies
router.post('/send-quick-replies', async (req, res) => {
    try {
        const { recipientId, messageText, quickReplies } = req.body;

        if (!recipientId || !messageText || !quickReplies) {
            return res.status(400).json({ error: 'recipientId, messageText và quickReplies là bắt buộc' });
        }

        const result = await messengerService.sendQuickReplies(recipientId, messageText, quickReplies);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Lỗi gửi quick replies:', error);
        res.status(500).json({ error: 'Lỗi gửi quick replies' });
    }
});

// API để gửi button message
router.post('/send-button-message', async (req, res) => {
    try {
        const { recipientId, messageText, buttons } = req.body;

        if (!recipientId || !messageText || !buttons) {
            return res.status(400).json({ error: 'recipientId, messageText và buttons là bắt buộc' });
        }

        const result = await messengerService.sendButtonMessage(recipientId, messageText, buttons);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Lỗi gửi button message:', error);
        res.status(500).json({ error: 'Lỗi gửi button message' });
    }
});

// API để đăng ký page subscription (theo chuẩn Meta)
router.post('/subscribe-page/:pageId', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { access_token, subscribed_fields = ['messages'] } = req.body;

        if (!access_token) {
            return res.status(400).json({ error: 'access_token là bắt buộc' });
        }

        const axios = require('axios');
        
        // Subscribe page to app
        const response = await axios.post(
            `https://graph.facebook.com/${pageId}/subscribed_apps`,
            {
                subscribed_fields: subscribed_fields.join(',')
            },
            {
                params: {
                    access_token: access_token
                }
            }
        );

        res.json({ 
            success: true, 
            data: response.data,
            message: `Page ${pageId} đã được đăng ký với các fields: ${subscribed_fields.join(', ')}`
        });

    } catch (error) {
        console.error('Lỗi đăng ký page subscription:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Lỗi đăng ký page subscription',
            details: error.response?.data || error.message
        });
    }
});

// API để kiểm tra page subscription
router.get('/page-subscriptions/:pageId', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { access_token } = req.query;

        if (!access_token) {
            return res.status(400).json({ error: 'access_token là bắt buộc' });
        }

        const axios = require('axios');
        
        const response = await axios.get(
            `https://graph.facebook.com/${pageId}/subscribed_apps`,
            {
                params: {
                    access_token: access_token
                }
            }
        );

        res.json({ 
            success: true, 
            data: response.data,
            message: `Danh sách apps đã subscribe page ${pageId}`
        });

    } catch (error) {
        console.error('Lỗi lấy page subscriptions:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Lỗi lấy page subscriptions',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router; 
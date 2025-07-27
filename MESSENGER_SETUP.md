# Hướng dẫn cấu hình Meta Messenger Webhook

Webhook của Meta cho phép bạn nhận thông báo HTTP theo thời gian thực về những thay đổi trong Messenger. Hướng dẫn này tuân theo tài liệu chính thức của Meta.

## 1. Cài đặt dependencies

Chạy lệnh sau để cài đặt axios:
```bash
npm install axios
```

## 2. Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Messenger Configuration (Required)
MESSENGER_VERIFY_TOKEN=your_custom_verify_token_here
MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token_here

# App Secret (Optional but recommended for production)
MESSENGER_APP_SECRET=your_app_secret_here
```

**Lưu ý**: 
- `MESSENGER_VERIFY_TOKEN`: Chuỗi tùy chỉnh để xác minh webhook
- `MESSENGER_PAGE_ACCESS_TOKEN`: Token để gửi tin nhắn qua Graph API
- `MESSENGER_APP_SECRET`: Để xác thực chữ ký webhook (khuyến nghị cho production)

### Lấy Page Access Token:

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới hoặc chọn app hiện có
3. Thêm sản phẩm "Messenger"
4. Tạo Page Access Token:
   - Vào "Messenger" > "Settings"
   - Tạo token cho page của bạn
   - Copy token và thêm vào `.env`

## 3. Cấu hình Webhook trên Facebook

### Bước 1: Đăng ký Webhook URL
1. Vào [Facebook Developers](https://developers.facebook.com/)
2. Chọn app của bạn
3. Vào "Messenger" > "Settings"
4. Trong phần "Webhooks", click "Add Callback URL"
5. Nhập URL: `https://yourdomain.com/api/messenger/webhook`
6. Verify Token: Nhập token đã cấu hình trong `.env`
7. Chọn các subscription fields:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
   - `message_reads`

### Bước 2: Cấu hình Page
1. Trong "Messenger" > "Settings"
2. Chọn page của bạn
3. Subscribe page to webhook

## 4. Test Webhook

### Kiểm tra cấu hình:
```bash
curl "https://yourdomain.com/api/messenger/webhook-info"
```

### Test webhook verification (theo chuẩn Meta):
```bash
curl -X GET "localhost:4000/api/messenger/webhook?hub.verify_token=YOUR-VERIFY-TOKEN&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
```

**Kết quả mong đợi:**
- Console: `WEBHOOK_VERIFIED`
- Response: `CHALLENGE_ACCEPTED`

### Test webhook event (theo chuẩn Meta):
```bash
curl -H "Content-Type: application/json" -X POST "localhost:4000/api/messenger/webhook" -d '{
  "object": "page",
  "entry": [{
    "messaging": [{
      "sender": {"id": "TEST_USER_ID"},
      "recipient": {"id": "PAGE_ID"},
      "message": {"text": "TEST_MESSAGE"}
    }]
  }]
}'
```

**Kết quả mong đợi:**
- Console: Logs xử lý tin nhắn
- Response: `EVENT_RECEIVED`

### Test gửi tin nhắn (admin):
```bash
curl -X POST "https://yourdomain.com/api/messenger/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "USER_ID_HERE",
    "messageText": "Test message from server"
  }'
```

### Test helpers có sẵn:
```bash
# Lấy hướng dẫn test verification
curl "https://yourdomain.com/api/messenger/test-verification"

# Lấy hướng dẫn test webhook event  
curl -X POST "https://yourdomain.com/api/messenger/test-webhook"
```

## 5. Đăng ký Page Subscription

Sau khi cấu hình webhook thành công, bạn cần đăng ký page để nhận webhook events:

### Sử dụng API:
```bash
curl -X POST "https://yourdomain.com/api/messenger/subscribe-page/PAGE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "PAGE_ACCESS_TOKEN",
    "subscribed_fields": ["messages", "messaging_postbacks", "message_deliveries", "message_reads"]
  }'
```

### Kiểm tra subscription:
```bash
curl "https://yourdomain.com/api/messenger/page-subscriptions/PAGE_ID?access_token=PAGE_ACCESS_TOKEN"
```

### Hoặc sử dụng Graph API trực tiếp:
```bash
curl -i -X POST "https://graph.facebook.com/PAGE-ID/subscribed_apps?subscribed_fields=messages&access_token=PAGE-ACCESS-TOKEN"
```

## 6. Các webhook events được hỗ trợ

Server hỗ trợ xử lý các webhook events sau theo chuẩn Meta:

- ✅ `messages`: Tin nhắn từ người dùng
- ✅ `messaging_postbacks`: Button clicks và postbacks
- ✅ `message_deliveries`: Thông báo tin nhắn đã gửi
- ✅ `message_reads`: Thông báo tin nhắn đã đọc
- ✅ `messaging_account_linking`: Liên kết tài khoản
- ✅ `messaging_optins`: Opt-in từ plugins
- ✅ `messaging_referrals`: Referral tracking

## 7. Các lệnh bot có sẵn

Bot sẽ phản hồi các lệnh sau:
- `hello` / `hi`: Chào hỏi và hướng dẫn với quick replies
- `flashcard`: Thông tin về chức năng flashcard
- `grammar`: Thông tin về chức năng ngữ pháp
- `speaking`: Thông tin về chức năng luyện nói
- `help`: Hướng dẫn sử dụng đầy đủ

## 8. Cấu hình Get Started Button (Tùy chọn)

Để thêm nút "Get Started", gửi request:

```bash
curl -X POST "https://graph.facebook.com/v17.0/me/messenger_profile?access_token=PAGE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "get_started": {
      "payload": "GET_STARTED"
    }
  }'
```

## 9. Cấu hình Persistent Menu (Tùy chọn)

```bash
curl -X POST "https://graph.facebook.com/v17.0/me/messenger_profile?access_token=PAGE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "persistent_menu": [
      {
        "locale": "default",
        "composer_input_disabled": false,
        "call_to_actions": [
          {
            "type": "postback",
            "title": "Flashcard",
            "payload": "FLASHCARD"
          },
          {
            "type": "postback",
            "title": "Grammar",
            "payload": "GRAMMAR"
          },
          {
            "type": "postback",
            "title": "Speaking",
            "payload": "SPEAKING"
          }
        ]
      }
    ]
  }'
```

## 10. Troubleshooting

### Lỗi thường gặp:

1. **Webhook verification failed**
   - Kiểm tra VERIFY_TOKEN trong `.env`
   - Đảm bảo token khớp với cấu hình trên Facebook

2. **Page Access Token invalid**
   - Kiểm tra PAGE_ACCESS_TOKEN trong `.env`
   - Đảm bảo token chưa hết hạn

3. **Webhook không nhận được tin nhắn**
   - Kiểm tra subscription fields đã được chọn
   - Đảm bảo page đã được subscribe

4. **Lỗi gửi tin nhắn**
   - Kiểm tra recipient ID có hợp lệ
   - Đảm bảo user đã từng nhắn tin với page

5. **Signature verification failed**
   - Kiểm tra MESSENGER_APP_SECRET trong `.env`
   - Đảm bảo app secret đúng với app Facebook
   - Trong development, có thể comment dòng verify signature

### Debug logs:
- Server sẽ log tất cả webhook events với emoji để dễ đọc
- Kiểm tra console để debug
- Sử dụng `/api/messenger/webhook-info` để kiểm tra cấu hình

## 11. Bảo mật

- Không commit file `.env` lên git
- Sử dụng HTTPS cho production
- Validate tất cả input từ webhook
- Rate limiting cho API endpoints

## 12. Production Deployment

1. Đảm bảo server có HTTPS
2. Cấu hình domain trong Facebook app
3. Test webhook trên production
4. Monitor logs và errors 
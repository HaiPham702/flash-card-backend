# Flash Card Server

Server backend cho ứng dụng học tập với các tính năng flashcard, grammar, speaking và writing.

## Tính năng

- 🔐 Authentication & Authorization
- 📚 Flashcard Management
- 📝 Grammar Practice
- 🗣️ Speaking Practice
- ✍️ Writing Assessment với AI
- 📊 Attendance Tracking
- 🤖 Messenger Bot Integration

## Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd server
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình Environment Variables
Tạo file `.env` trong thư mục `server`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/flashcard-app

# JWT
JWT_SECRET=your_jwt_secret_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Messenger Configuration
MESSENGER_VERIFY_TOKEN=your_custom_verify_token_here
MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token_here

# Server
PORT=4000
NODE_ENV=development
```

### 4. Chạy server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Decks (Flashcards)
- `GET /api/decks` - Lấy danh sách decks
- `POST /api/decks` - Tạo deck mới
- `GET /api/decks/:id` - Lấy chi tiết deck
- `PUT /api/decks/:id` - Cập nhật deck
- `DELETE /api/decks/:id` - Xóa deck

### Grammar
- `GET /api/grammar/topics` - Lấy danh sách chủ đề ngữ pháp
- `GET /api/grammar/topics/:id` - Lấy chi tiết chủ đề
- `POST /api/grammar/practice` - Luyện tập ngữ pháp

### Speaking
- `GET /api/speaking/topics` - Lấy danh sách chủ đề speaking
- `POST /api/speaking/practice` - Luyện tập speaking
- `POST /api/speaking/assess` - Đánh giá speaking

### Writing
- `POST /api/writing/assess` - Đánh giá bài viết
- `GET /api/writing/history` - Lịch sử bài viết

### Attendance
- `POST /api/attendance/check-in` - Check-in hàng ngày
- `GET /api/attendance/stats` - Thống kê attendance

### AI
- `POST /api/ai/chat` - Chat với AI
- `POST /api/ai/explain` - Giải thích với AI

### Messenger Bot
- `GET /api/messenger/webhook` - Webhook verification
- `POST /api/messenger/webhook` - Nhận tin nhắn từ Messenger
- `GET /api/messenger/webhook-info` - Thông tin webhook
- `POST /api/messenger/send-message` - Gửi tin nhắn
- `POST /api/messenger/send-quick-replies` - Gửi quick replies
- `POST /api/messenger/send-button-message` - Gửi button message
- `GET /api/messenger/user-info/:userId` - Thông tin user
- `POST /api/messenger/setup-get-started` - Cấu hình Get Started Button
- `POST /api/messenger/setup-persistent-menu` - Cấu hình Persistent Menu

## Messenger Bot Setup

### 1. Cấu hình Facebook App
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới hoặc chọn app hiện có
3. Thêm sản phẩm "Messenger"
4. Tạo Page Access Token

### 2. Cấu hình Environment Variables
```env
MESSENGER_VERIFY_TOKEN=your_custom_verify_token_here
MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token_here
```

### 3. Setup Messenger Bot
```bash
# Setup tất cả
node scripts/setup-messenger.js

# Hoặc setup từng phần
node scripts/setup-messenger.js get-started
node scripts/setup-messenger.js persistent-menu
node scripts/setup-messenger.js page-info
```

### 4. Cấu hình Webhook
1. Vào Facebook Developers > App > Messenger > Settings
2. Thêm webhook URL: `https://yourdomain.com/api/messenger/webhook`
3. Verify Token: Nhập token từ `.env`
4. Subscribe các events: `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`

### 5. Test Bot
```bash
# Test gửi tin nhắn
node scripts/setup-messenger.js test-message <recipient_id> "Hello bot!"
```

## Cấu trúc thư mục

```
server/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── attendanceController.js
│   └── speakingController.js
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── Attendance.js
│   ├── Deck.js
│   ├── SpeakingTopic.js
│   ├── User.js
│   └── WritingSubmission.js
├── routes/
│   ├── ai.js
│   ├── attendanceRoutes.js
│   ├── auth.js
│   ├── decks.js
│   ├── messenger.js          # Messenger webhook routes
│   ├── speakingRoutes.js
│   └── writing.js
├── services/
│   ├── messengerService.js   # Messenger bot service
│   └── speakingService.js
├── scripts/
│   └── setup-messenger.js    # Messenger setup script
├── tests/
│   ├── fixtures/
│   ├── integration/
│   └── unit/
├── app.js
├── server.js
└── package.json
```

## Development

### Chạy tests
```bash
npm test
```

### Debug mode
```bash
npm run debug
```

### Linting
```bash
npm run lint
```

## Deployment

### Production
1. Cấu hình environment variables cho production
2. Build và deploy
3. Cấu hình HTTPS (bắt buộc cho Messenger webhook)
4. Cập nhật webhook URL trên Facebook Developers

### Environment Variables cho Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
MESSENGER_VERIFY_TOKEN=your_verify_token
MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token
```

## Troubleshooting

### Messenger Bot Issues
1. **Webhook verification failed**
   - Kiểm tra VERIFY_TOKEN trong `.env`
   - Đảm bảo token khớp với cấu hình trên Facebook

2. **Page Access Token invalid**
   - Kiểm tra PAGE_ACCESS_TOKEN trong `.env`
   - Đảm bảo token chưa hết hạn

3. **Webhook không nhận được tin nhắn**
   - Kiểm tra subscription fields đã được chọn
   - Đảm bảo page đã được subscribe

### Database Issues
1. **Connection failed**
   - Kiểm tra MONGODB_URI
   - Đảm bảo MongoDB đang chạy

### AI Integration Issues
1. **OpenAI API errors**
   - Kiểm tra OPENAI_API_KEY
   - Đảm bảo có đủ credits

2. **Google AI API errors**
   - Kiểm tra GOOGLE_AI_API_KEY
   - Đảm bảo API được enable

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

ISC 
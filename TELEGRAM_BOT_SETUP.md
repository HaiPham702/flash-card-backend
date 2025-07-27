# 🤖 Hướng Dẫn Cấu Hình Telegram Bot

## 📋 Tổng Quan

Hệ thống Telegram Bot tự động gửi flashcard ngẫu nhiên **cứ 2 tiếng từ 8:30 sáng đến 4:30 chiều** cho tất cả người dùng đã đăng ký. Bot hỗ trợ:

- ✅ Gửi thông báo flashcard **5 lần/ngày** (8:30, 10:30, 12:30, 14:30, 16:30)
- ✅ Commands tương tác với bot (/start, /card, /stop)
- ✅ Quản lý user thông qua getUpdates API
- ✅ Hỗ trợ ảnh và text formatting với Markdown
- ✅ **UI quản lý hoàn chỉnh** với dashboard
- ✅ **Schedule management** - bật/tắt từng time slot
- ✅ **Broadcast functionality** - gửi tin nhắn tùy chỉnh
- ✅ **Real-time statistics** và monitoring
- ✅ API management cho admin

## 🚀 Bước 1: Tạo Bot với BotFather

### 1.1 Tạo Bot Mới
1. Mở Telegram và tìm `@BotFather`
2. Gửi lệnh `/newbot`
3. Nhập tên bot (ví dụ: `Anki Clone Bot`)
4. Nhập username bot (phải kết thúc bằng `bot`, ví dụ: `ankiclone_bot`)
5. Lưu lại **Bot Token** mà BotFather cung cấp

### 1.2 Cấu Hình Bot
```bash
# Gửi các lệnh sau cho @BotFather:

/setdescription
# Nhập: "Bot gửi flashcard học từ vựng hàng ngày"

/setabouttext  
# Nhập: "Anki Clone - Học từ vựng thông minh với flashcard"

/setcommands
# Nhập:
start - Bắt đầu và đăng ký nhận thông báo
card - Lấy một flashcard ngẫu nhiên  
stop - Tắt thông báo hàng ngày
```

## 🔧 Bước 2: Cấu Hình Server

### 2.1 Environment Variables
Thêm vào file `.env`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Ví dụ:
# TELEGRAM_BOT_TOKEN=6123456789:AAFz-abc123def456ghi789jkl012mno345
```

### 2.2 Cài Đặt Dependencies
```bash
cd server
npm install node-cron
```

### 2.3 Khởi Động Server
```bash
npm run dev
# hoặc
npm start
```

Khi server khởi động, bạn sẽ thấy:
```
✅ Đã thiết lập cron job gửi thông báo hàng ngày lúc 8:30 AM (GMT+7)
🚀 Khởi tạo Telegram Scheduler Service...
```

## 🔗 Bước 3: Cấu Hình Webhook (Tùy Chọn)

### 3.1 Webhook cho Production
Nếu deploy lên server production, có thể cấu hình webhook:

```bash
# Set webhook URL
curl -X POST \
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://yourdomain.com/api/telegram/webhook"
  }'
```

### 3.2 Kiểm Tra Webhook
```bash
# Check webhook info
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## 🎮 Bước 4: Sử Dụng Bot

### 4.1 User Commands
- `/start` - Đăng ký nhận thông báo hàng ngày
- `/card` - Lấy flashcard ngẫu nhiên ngay lập tức
- `/stop` - Tắt thông báo hàng ngày

### 4.2 Tự Động Đăng Ký User
Bot tự động đăng ký user khi họ gửi tin nhắn đầu tiên:
- Tạo user mới trong database
- Lưu Telegram chat ID
- Bật thông báo hàng ngày mặc định

## 🛠️ API Management

### 4.3 Admin APIs
Các API sau cần authentication (JWT token):

```bash
# Basic APIs
GET /api/telegram/test                          # Test bot connection
POST /api/telegram/send-daily-notifications     # Gửi thông báo thủ công
POST /api/telegram/sync-users                   # Đồng bộ users từ getUpdates
POST /api/telegram/send-card/{chatId}           # Gửi card cho user cụ thể
GET /api/telegram/stats                         # Xem thống kê

# NEW: User Management APIs
GET /api/telegram/users                         # Lấy danh sách users
POST /api/telegram/users/{chatId}/settings      # Cập nhật user settings

# NEW: Schedule Management APIs  
GET /api/telegram/schedule                      # Lấy cấu hình schedule
POST /api/telegram/schedule                     # Cập nhật schedule config
POST /api/telegram/schedule/toggle              # Bật/tắt time slot
POST /api/telegram/schedule/add                 # Thêm custom time slot
DELETE /api/telegram/schedule/{timeLabel}       # Xóa time slot

# NEW: Broadcast APIs
POST /api/telegram/broadcast                    # Broadcast tin nhắn hoặc cards
```

### 4.4 Ví Dụ Sử Dụng API
```javascript
// Test bot
const response = await fetch('/api/telegram/test', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Gửi thông báo thủ công
const result = await fetch('/api/telegram/send-daily-notifications', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Đồng bộ users
const sync = await fetch('/api/telegram/sync-users', {
  method: 'POST', 
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🖥️ UI Quản Lý (MỚI!)

### 7.1 Truy Cập UI Management
- **URL:** `http://localhost:3000/telegram`
- **Navigation:** Nhấp "🤖 Telegram Bot" trên menu chính
- **Yêu cầu:** Đăng nhập với tài khoản admin

### 7.2 Tính Năng UI
#### 📊 Statistics Dashboard
- Tổng số users Telegram
- Users có bật thông báo
- Time slots đang hoạt động
- Users nhận nhắc nhở hàng ngày

#### ⏰ Schedule Management Tab
- Xem tất cả time slots (8:30, 10:30, 12:30, 14:30, 16:30)
- Bật/tắt từng time slot riêng biệt
- Thêm custom time slots mới
- Xóa time slots không cần
- Real-time status monitoring

#### 👥 Users Management Tab
- Danh sách tất cả users Telegram
- Thông tin chi tiết (tên, username, chat ID)
- Trạng thái thông báo của từng user
- Gửi flashcard cho user cụ thể
- Cài đặt notification preferences

#### 🚀 Quick Actions Tab
- Gửi thông báo ngay lập tức
- Test bot connection
- Broadcast tin nhắn tùy chỉnh
- Đồng bộ users từ Telegram

#### 📢 Broadcast Modal
- Gửi tin nhắn text tùy chỉnh
- Gửi flashcard ngẫu nhiên
- Chọn users cụ thể hoặc gửi tất cả
- Real-time progress tracking

### 7.3 Responsive Design
- Tối ưu cho desktop và mobile
- Dark/Light theme tự động
- Intuitive user interface
- Real-time updates

## ⏰ Cấu Hình Thời Gian

### 8.1 Multiple Time Slots Mặc Định
- **8:30 AM** - Sáng
- **10:30 AM** - Giữa sáng  
- **12:30 PM** - Trưa
- **2:30 PM** - Chiều
- **4:30 PM** - Chiều muộn
- **Múi giờ:** `Asia/Ho_Chi_Minh` (GMT+7)

### 5.2 Thay Đổi Thời Gian
Chỉnh sửa trong `schedulerService.js`:

```javascript
// Thay đổi từ '30 8 * * *' thành thời gian mong muốn
// Format: 'phút giờ * * *'

// Ví dụ 7:00 AM:
const dailyJob = cron.schedule('0 7 * * *', async () => {
    // ...
});

// Ví dụ 9:15 AM:  
const dailyJob = cron.schedule('15 9 * * *', async () => {
    // ...
});
```

### 5.3 Multiple Time Slots
Có thể tạo nhiều job cho các thời điểm khác nhau:

```javascript
// Job 8:30 AM
cron.schedule('30 8 * * *', sendMorningCards);

// Job 6:00 PM  
cron.schedule('0 18 * * *', sendEveningCards);
```

## 🧪 Testing

### 6.1 Test Job (Development)
Uncomment dòng này trong `schedulerService.js` để test:
```javascript
// this.setupTestJob(); // Gửi thông báo mỗi 5 phút
```

### 6.2 Manual Testing
```bash
# Test gửi thông báo ngay
curl -X POST http://localhost:4000/api/telegram/send-daily-notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test đồng bộ users
curl -X POST http://localhost:4000/api/telegram/sync-users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Format Tin Nhắn

### 6.3 Template Tin Nhắn
```
🎴 **Flashcard hôm nay**

📚 **Deck:** English Vocabulary

🔤 **Mặt trước:** Hello

💡 **Mặt sau:** Xin chào

🗣️ **Phát âm:** /həˈloʊ/

⏰ Hãy ôn tập và học từ mới mỗi ngày nhé! 📖✨
```

### 6.4 Hỗ Trợ Ảnh
- Nếu card có field `image`, bot sẽ gửi ảnh kèm caption
- Nếu không có ảnh, chỉ gửi text

## 🔒 Security & Limitations

### 7.1 Rate Limiting
- Bot gửi tối đa 5 users cùng lúc
- Delay 1 giây giữa các batch
- Tránh bị Telegram rate limit

### 7.2 Error Handling
- Retry mechanism cho failed messages
- Log chi tiết lỗi
- Graceful degradation

### 7.3 Privacy
- Chỉ lưu chat ID và username
- Không lưu trữ nội dung tin nhắn
- User có thể tắt thông báo bất kỳ lúc nào

## 🐛 Troubleshooting

### 8.1 Bot Không Phản Hồi
```bash
# Check bot token
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# Check logs
tail -f server_logs.txt
```

### 8.2 Cron Job Không Chạy
```bash
# Check server timezone
date
timedatectl

# Check cron expression
node -e "const cron = require('node-cron'); console.log(cron.validate('30 8 * * *'));"
```

### 8.3 Database Issues
```javascript
// Check users có telegram chatId
db.users.find({ telegramChatId: { $exists: true } })

// Check notification settings
db.users.find({ "telegramNotifications.enabled": true })
```

## 📈 Monitoring

### 8.4 Logs
Server sẽ log:
- ✅ Thành công gửi cho từng user
- ❌ Lỗi gửi tin nhắn
- 📊 Thống kê tổng kết

### 8.5 Health Check
```bash
# API health check
curl http://localhost:4000/api/telegram/test

# Job status  
curl http://localhost:4000/api/telegram/stats
```

---

## 🧪 Testing Scripts (CẬP NHẬT)

### Test Scripts Có Sẵn
```bash
# Setup bot từ A-Z
node scripts/setup-telegram.js

# Test cơ bản bot và APIs  
node scripts/test-telegram.js

# NEW: Test hệ thống hoàn chỉnh
node scripts/test-telegram-system.js
```

### Test System Script (MỚI)
Script `test-telegram-system.js` test toàn bộ hệ thống:
- ✅ Multiple time slots configuration
- ✅ All API endpoints 
- ✅ Schedule management functionality
- ✅ Broadcast capabilities
- ✅ UI integration testing
- ✅ End-to-end workflow

## 📊 System Monitoring

### Real-time Logs
Server sẽ log chi tiết:
```
⏰ Chạy cron job gửi thông báo - 8:30 AM
✅ [8:30 AM] Hoàn thành gửi thông báo: 15 thành công, 0 thất bại
⏰ Chạy cron job gửi thông báo - 10:30 AM  
✅ [10:30 AM] Hoàn thành gửi thông báo: 15 thành công, 0 thất bại
```

### Health Check
- UI Dashboard: Real-time statistics
- API Health: `/api/telegram/test`
- Job Status: `/api/telegram/schedule`
- User Status: `/api/telegram/stats`

## 🎉 Kết Luận

### ✨ Tính Năng Hoàn Chỉnh
1. ✅ **Multiple Time Slots**: 5 lần gửi mỗi ngày (8:30-16:30, cứ 2 tiếng)
2. ✅ **UI Management**: Dashboard quản lý hoàn chỉnh  
3. ✅ **Schedule Control**: Bật/tắt từng time slot độc lập
4. ✅ **Broadcast System**: Gửi tin nhắn tùy chỉnh cho users
5. ✅ **User Management**: Quản lý chi tiết từng user
6. ✅ **Real-time Stats**: Monitoring và analytics
7. ✅ **API Complete**: 15+ endpoints quản lý
8. ✅ **Responsive UI**: Tối ưu mọi thiết bị

### 🚀 Quick Start
```bash
# 1. Setup bot
node scripts/setup-telegram.js

# 2. Start server  
npm run dev

# 3. Access UI
# http://localhost:3000/telegram

# 4. Test everything
node scripts/test-telegram-system.js
```

**Lưu ý:** Backup Bot Token và cấu hình webhook cho production!

---

Có thắc mắc? Check logs hoặc sử dụng API `/test` để troubleshoot! 🚀 
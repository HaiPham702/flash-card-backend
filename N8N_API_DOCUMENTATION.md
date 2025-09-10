# N8N API Integration Documentation

## Tổng quan

API này cho phép server FlashCard tương tác với n8n webhook tại `https://n8n-s2gy.onrender.com/healthz`.

## Endpoints

### 1. Health Check

**GET** `/api/n8n/health`

Kiểm tra trạng thái của n8n webhook.

#### Response thành công:
```json
{
  "success": true,
  "message": "n8n webhook call successful",
  "data": {
    "status": "ok"
  },
  "status": 200,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Response lỗi:
```json
{
  "success": false,
  "message": "Failed to call n8n webhook",
  "error": "Error message here",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Webhook Data Send

**POST** `/api/n8n/webhook`

Gửi dữ liệu đến n8n webhook.

#### Request Body:
```json
{
  "message": "Your message here",
  "data": {
    "key": "value"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Response thành công:
```json
{
  "success": true,
  "message": "Data sent to n8n webhook successfully",
  "data": {
    "status": "ok"
  },
  "status": 200,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Cách sử dụng

### 1. Khởi động server
```bash
cd server
npm start
# hoặc
npm run dev
```

### 2. Test API
```bash
# Test health check
curl http://localhost:3000/api/n8n/health

# Test webhook với dữ liệu
curl -X POST http://localhost:3000/api/n8n/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from FlashCard Server"}'
```

### 3. Chạy test script
```bash
cd server
node scripts/test-n8n-api.js
```

## Cấu hình

### Timeout
- Mặc định: 10 giây
- Có thể điều chỉnh trong file `routes/n8n.js`

### Headers
- `Content-Type: application/json`
- `User-Agent: FlashCard-Server/1.0.0`

## Xử lý lỗi

API sẽ trả về lỗi 500 nếu:
- Không thể kết nối đến n8n webhook
- Timeout
- Lỗi network khác

## Logging

Tất cả các request và response đều được log ra console để debug.

## Dependencies

- `axios`: ^1.6.0 (đã có sẵn trong package.json)
- `express`: ^4.18.2 (đã có sẵn)

## Ví dụ sử dụng trong code

```javascript
// Trong controller hoặc service
const axios = require('axios');

async function callN8nWebhook(data) {
  try {
    const response = await axios.post('http://localhost:3000/api/n8n/webhook', data);
    return response.data;
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    throw error;
  }
}
```


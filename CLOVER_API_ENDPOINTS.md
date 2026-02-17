# 🔗 Clover API Endpoints - مرجع سريع

## 📋 جدول محتويات

- [Backend Endpoints](#backend-endpoints)
- [Frontend API Calls](#frontend-api-calls)
- [Clover API Endpoints](#clover-api-endpoints)
- [Request/Response Examples](#requestresponse-examples)

---

## 🔙 Backend Endpoints (Laravel)

### 1. معالجة الدفع

```http
POST /api/payments/process
Content-Type: application/json
```

**Request Body:**

```json
{
  "clover_token": "tok_1234567890abcdef",
  "amount": 25.5,
  "order_id": 123
}
```

**Response - Success:**

```json
{
  "success": true,
  "message": "Payment successful",
  "charge_id": "CHG_ABC123",
  "amount": 25.5
}
```

**Response - Error:**

```json
{
  "success": false,
  "message": "Payment failed",
  "error": "Insufficient funds"
}
```

---

### 2. استرجاع الأموال (Refund)

```http
POST /api/payments/refund
Content-Type: application/json
```

**Request Body:**

```json
{
  "charge_id": "CHG_ABC123",
  "amount": 25.5 // اختياري - إذا لم يتم تحديده، سيتم استرجاع المبلغ كاملاً
}
```

**Response:**

```json
{
  "success": true,
  "message": "Refund successful",
  "refund": {
    "id": "RFD_XYZ789",
    "amount": 2550,
    "status": "succeeded"
  }
}
```

---

### 3. التحقق من حالة الدفع

```http
GET /api/payments/status/{charge_id}
```

**Response:**

```json
{
  "success": true,
  "charge": {
    "id": "CHG_ABC123",
    "amount": 2550,
    "status": "succeeded",
    "created": "2024-01-15T10:30:00Z"
  }
}
```

---

## 💻 Frontend API Calls (Next.js)

### استخدام `axiosClient.js`

#### ملف `api/axiosClient.js`:

```javascript
import axios from "axios";

export default function api() {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return api;
}
```

### 1. استدعاء API الدفع من Component

```javascript
import api from "@/api/axiosClient";

// في Component مثل CloverPayment.jsx
const processPayment = async (cloverToken, amount, orderId) => {
  try {
    const response = await api().post("/api/payments/process", {
      clover_token: cloverToken,
      amount: amount,
      order_id: orderId,
    });

    if (response.data.success) {
      console.log("Payment successful:", response.data);
      return response.data;
    }
  } catch (error) {
    console.error("Payment error:", error.response?.data);
    throw error;
  }
};
```

### 2. استدعاء Refund API

```javascript
import api from "@/api/axiosClient";

const refundPayment = async (chargeId, amount) => {
  try {
    const response = await api().post("/api/payments/refund", {
      charge_id: chargeId,
      amount: amount, // اختياري
    });

    return response.data;
  } catch (error) {
    console.error("Refund error:", error);
    throw error;
  }
};
```

### 3. التحقق من حالة الدفع

```javascript
import api from "@/api/axiosClient";

const checkPaymentStatus = async (chargeId) => {
  try {
    const response = await api().get(`/api/payments/status/${chargeId}`);
    return response.data;
  } catch (error) {
    console.error("Status check error:", error);
    throw error;
  }
};
```

---

## 🌐 Clover API Endpoints (Production)

### Base URLs

**Sandbox (Testing):**

```
https://sandbox.dev.clover.com
```

**Production (Live):**

```
https://api.clover.com
```

---

### 1. إنشاء دفعة (Create Charge)

```http
POST https://api.clover.com/v1/charges
Authorization: Bearer {PRIVATE_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "source": "tok_abc123xyz",
  "amount": 2550,
  "currency": "usd",
  "capture": true,
  "description": "Order #123"
}
```

**Response:**

```json
{
  "id": "CHG_ABC123",
  "amount": 2550,
  "amount_refunded": 0,
  "captured": true,
  "created": 1673780400000,
  "currency": "usd",
  "status": "succeeded",
  "source": {
    "id": "tok_abc123xyz"
  }
}
```

---

### 2. استرجاع معلومات دفعة (Get Charge)

```http
GET https://api.clover.com/v1/charges/{CHARGE_ID}
Authorization: Bearer {PRIVATE_TOKEN}
```

**Response:**

```json
{
  "id": "CHG_ABC123",
  "amount": 2550,
  "status": "succeeded",
  "created": 1673780400000
}
```

---

### 3. استرجاع أموال (Create Refund)

```http
POST https://api.clover.com/v1/charges/{CHARGE_ID}/refunds
Authorization: Bearer {PRIVATE_TOKEN}
Content-Type: application/json
```

**Request Body (استرجاع جزئي):**

```json
{
  "amount": 1000
}
```

**Request Body (استرجاع كامل):**

```json
{}
```

**Response:**

```json
{
  "id": "RFD_XYZ789",
  "amount": 1000,
  "charge": "CHG_ABC123",
  "created": 1673780500000,
  "status": "succeeded"
}
```

---

### 4. قائمة كل الدفعات (List Charges)

```http
GET https://api.clover.com/v1/charges?limit=10&offset=0
Authorization: Bearer {PRIVATE_TOKEN}
```

**Response:**

```json
{
  "data": [
    {
      "id": "CHG_ABC123",
      "amount": 2550,
      "status": "succeeded"
    },
    {
      "id": "CHG_DEF456",
      "amount": 5000,
      "status": "succeeded"
    }
  ],
  "has_more": false
}
```

---

## 📦 Request/Response Examples

### مثال كامل: من Frontend إلى Backend إلى Clover

#### 1️⃣ Frontend يحصل على Token من Clover SDK

```javascript
// في CloverPayment.jsx
const handlePayment = async () => {
  try {
    // إنشاء Token من Clover SDK
    const result = await cloverInstanceRef.current.createToken();

    if (!result.token) {
      throw new Error("Failed to create token");
    }

    const cloverToken = result.token;
    console.log("Token:", cloverToken); // tok_abc123...

    // إرسال Token للـ Backend
    await processPaymentOnBackend(cloverToken);
  } catch (error) {
    console.error("Payment error:", error);
  }
};
```

#### 2️⃣ Frontend يرسل للـ Backend

```javascript
const processPaymentOnBackend = async (cloverToken) => {
  const response = await api().post("/api/payments/process", {
    clover_token: cloverToken, // من Clover SDK
    amount: 25.5, // المبلغ بالدولار
    order_id: 123, // رقم الطلب
  });

  console.log("Backend response:", response.data);
  // { success: true, charge_id: "CHG_ABC123", amount: 25.50 }
};
```

#### 3️⃣ Backend يرسل لـ Clover API

```php
// في CloverService.php
public function createCharge($cloverToken, $amount, $orderId)
{
    $response = Http::withHeaders([
        'Authorization' => "Bearer {$this->privateToken}",
        'Content-Type' => 'application/json',
    ])->post("{$this->apiUrl}/v1/charges", [
        'source' => $cloverToken,       // من Frontend
        'amount' => $amount * 100,      // تحويل لسنت: $25.50 = 2550
        'currency' => 'usd',
        'capture' => true,
        'description' => "Order #{$orderId}",
    ]);

    return $response->json();
}
```

#### 4️⃣ Clover يرد على Backend

```json
{
  "id": "CHG_ABC123",
  "amount": 2550,
  "captured": true,
  "status": "succeeded",
  "created": 1673780400000
}
```

#### 5️⃣ Backend يرد على Frontend

```json
{
  "success": true,
  "message": "Payment successful",
  "charge_id": "CHG_ABC123",
  "amount": 25.5
}
```

---

## 🔄 Flow Diagram

```
┌─────────────────┐
│   User enters   │
│   card info     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clover SDK     │  clover.createToken()
│  (Frontend)     │  Returns: tok_abc123...
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │  POST /api/payments/process
│  API Call       │  Body: { clover_token, amount, order_id }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Laravel        │  PaymentController@processPayment
│  Backend        │  Validates request
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CloverService  │  POST https://api.clover.com/v1/charges
│  (Backend)      │  Authorization: Bearer {private_token}
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clover API     │  Processes payment
│  (Production)   │  Returns charge result
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend saves  │  Store in database:
│  to database    │  - charge_id, order_id, amount, status
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │  Shows success message
│  receives       │  "Payment Successful! ✅"
│  response       │
└─────────────────┘
```

---

## 🔐 Authentication Headers

### Backend → Clover API

```http
Authorization: Bearer YOUR_PRIVATE_TOKEN
Content-Type: application/json
```

### Frontend → Backend

```http
Content-Type: application/json
Accept: application/json
Cookie: session_cookie (if using sessions)
```

---

## ⚠️ Error Codes

### Clover API Error Codes

| Code | Status            | Meaning                   |
| ---- | ----------------- | ------------------------- |
| 400  | Bad Request       | خطأ في البيانات المرسلة   |
| 401  | Unauthorized      | Token خاطئ أو منتهي       |
| 402  | Payment Required  | البطاقة مرفوضة            |
| 404  | Not Found         | Charge ID غير موجود       |
| 429  | Too Many Requests | تجاوز الحد الأقصى للطلبات |
| 500  | Server Error      | خطأ في خوادم Clover       |

### Backend Error Responses

```json
{
  "success": false,
  "message": "Payment failed",
  "error": "Card declined",
  "error_code": "card_declined"
}
```

---

## 📝 Testing

### Sandbox Test Cards

**Visa - Success:**

```
Card: 4111 1111 1111 1111
Exp: 12/25
CVV: 123
ZIP: 12345
```

**Visa - Decline:**

```
Card: 4000 0000 0000 0002
Exp: 12/25
CVV: 123
ZIP: 12345
```

**Mastercard - Success:**

```
Card: 5555 5555 5555 4444
Exp: 12/25
CVV: 123
ZIP: 12345
```

### Test API Call (cURL)

```bash
# Backend to Clover API
curl -X POST https://sandbox.dev.clover.com/v1/charges \
  -H "Authorization: Bearer YOUR_PRIVATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "tok_abc123",
    "amount": 2550,
    "currency": "usd",
    "capture": true
  }'
```

---

## 🔗 Environment URLs

### Sandbox

- **SDK**: `https://checkout.sandbox.dev.clover.com/sdk.js`
- **API**: `https://sandbox.dev.clover.com`
- **Dashboard**: `https://sandbox.dev.clover.com/dashboard`

### Production

- **SDK**: `https://checkout.clover.com/sdk.js`
- **API**: `https://api.clover.com`
- **Dashboard**: `https://www.clover.com/dashboard`

---

## 📚 المزيد من الموارد

- [دليل Production الكامل](./CLOVER_PRODUCTION_GUIDE.md)
- [دليل الاختبار](./TESTING_CLOVER.md)
- [Clover API Docs](https://docs.clover.com/reference)

---

**✅ مرجع سريع للـ API Endpoints** 🚀

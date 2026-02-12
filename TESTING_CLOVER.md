# 🧪 اختبار Clover Iframe SDK Integration

## ✅ المتطلبات قبل الاختبار

### 1. تأكد من وجود `.env` Variables:

```env
NEXT_PUBLIC_ENV_MODE=sandbox
NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX=af2aab20e19f56b2290797cb60abb149
NEXT_PUBLIC_CLOVER_API_SANDBOX=https://sandbox.dev.clover.com
```

### 2. تأكد أن `api/axiosClient.js` موجود ويعمل:

```javascript
import axios from "axios";

export default function api() {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    withCredentials: true,
  });
  return api;
}
```

### 3. تأكد من أن Laravel Backend يستمع على:

```
http://localhost:8000
```

---

## 🚀 خطوات الاختبار

### الخطوة 1: تشغيل Next.js App

```bash
npm run dev
# أو
yarn dev
```

### الخطوة 2: الذهاب إلى صفحة الدفع

```
http://localhost:3000/delivry
```

### الخطوة 3: أضف عناصر إلى السلة وقم بالدفع

- أضف سلع للسلة
- اضغط "Proceed to Checkout"
- ستظهر نافذة الدفع (Payment Modal)

---

## 🧪 اختبار Clover SDK

### في متصفح (Browser Console):

```javascript
// تحقق من تحميل SDK
console.log(window.Clover);

// يجب أن تظهر دالة الـ Clover class
// إذا كانت undefined، معناه SDK لم يحمل
```

### علامات النجاح:

✅ ظهور رسالة "جاري تحميل نظام الدفع..."  
✅ وجود div بـ Card Element  
✅ تحميل Clover Iframe  
✅ إمكانية كتابة رقم البطاقة في الحقل

---

## 📝 بيانات الاختبار

### بطاقات ناجحة في Sandbox:

```
Visa:
  رقم: 4111 1111 1111 1111
  Expiry: 12/25
  CVV: 123

Mastercard:
  رقم: 5555 5555 5555 4444
  Expiry: 12/25
  CVV: 123

American Express:
  رقم: 3782 822463 10005
  Expiry: 12/25
  CVV: 1234
```

### بطاقات فاشلة (للاختبار):

```
فشل عام:
  رقم: 4000 0000 0000 0002
  Expiry: أي تاريخ
  CVV: أي 3 أرقام
```

---

## 📊 الدفق الذي سيحدث

### 1. عند فتح Payment Modal:

```
Clover Payment Component يحمل
  ↓
SDK يحمل من https://checkout.clover.com/sdk.js
  ↓
clover.elements() ينشئ
  ↓
card element يُنشأ
  ↓
card.mount("#card-element") يتم
  ↓
✅ Iframe من Clover يظهر
```

### 2. عند ملء البطاقة:

```
المستخدم يدخل رقم البطاقة في Iframe
  ↓
Clover يتحقق من صحة الرقم
  ↓
عند الضغط على "إتمام الدفع"
  ↓
clover.createToken() يُستدعى
  ↓
✅ Token ينشأ من Clover (مثل: tok_1707644400123_abc...)
```

### 3. إرسال Token:

```
clover.createToken() → result.token
  ↓
axios POST /api/payments/token
  ↓
✅ Backend يسجل Token
  ↓
callback يُستدعى مع Token
  ↓
Token يُمرر إلى newOrderDelivery()
  ↓
Order + Token يُبعثان معاً إلى /api/orders/delivry
```

---

## 🔍 Debugging - التحقق من الأخطاء

### في Browser Console:

```javascript
// تحقق من Clover
window.Clover;
// يجب أن تكون دالة constructible

// تحقق من Instance
window.cloverInstance;
// يجب أن يكون object مع methods

// تحقق من Card Element
window.cloverInstance.elements();
// يجب أن يكون object
```

### في Network Tab:

```
تحقق من:
1. https://checkout.clover.com/sdk.js - يجب Status 200
2. POST /api/payments/token - يجب Status 200
3. POST /api/orders/delivry - يجب Status 201
```

### في Console Logs:

```javascript
// يجب أن تظهر:
"Token sent to backend: {success: true, ...}";
"✅ تم التحقق من البطاقة بنجاح!";
```

---

## 🚨 مشاكل شائعة وحلولها

### المشكلة 1: "فشل تحميل Clover SDK"

**السبب**: URL خاطئ أو عدم وجود internet  
**الحل**:

```javascript
// تحقق في console:
console.log(document.querySelector('script[src*="clover"]'));

// تأكد من URL:
// https://checkout.clover.com/sdk.js ✅
```

### المشكلة 2: "Card element لم ينمنت"

**السبب**: div#card-element غير موجود  
**الحل**:

```javascript
// في Browser:
document.getElementById("card-element");
// يجب أن يعيد element وليس null
```

### المشكلة 3: "clover.createToken() فشل"

**السبب**: بطاقة غير صحيحة أو SDK لم يحمل  
**الحل**:

```javascript
// استخدم بطاقات الاختبار أعلاه
// تأكد من أن SDK محمل: window.Clover
```

### المشكلة 4: "Backend لم يستقبل Token"

**السبب**: axios أو baseURL خاطئ  
**الحل**:

```javascript
// في console:
// تحقق من baseURL:
// http://localhost:8000 ✅

// تأكد من Laravel Server يشتغل:
// curl http://localhost:8000/api/payments/token -X POST
```

---

## 📋 Checklist اختبار كامل

- [ ] SDK يحمل من https://checkout.clover.com/sdk.js
- [ ] `window.Clover` موجود في console
- [ ] Card Element ينمنت في div
- [ ] يمكن كتابة بطاقة في الحقل
- [ ] عند الضغط على زر الدفع، كلور يعطي token
- [ ] Token يبعت إلى `/api/payments/token`
- [ ] `/api/payments/token` يرجع 200 status
- [ ] Token يبعت مع Order إلى `/api/orders/delivry`
- [ ] `/api/orders/delivry` يرجع 201 status
- [ ] Order يُحفظ في Database مع payment_token
- [ ] رسالة النجاح تظهر إلى المستخدم

---

## 🎯 النتيجة النهائية المتوقعة

### عند نجاح الدفع:

```
✅ تم الدفع بنجاح! ✅
جاري معالجة طلبك...
Token: tok_1707644400123_abc...
```

### في Database:

```sql
SELECT * FROM orders WHERE id = X;

-- يجب أن يظهر:
{
  id: X,
  restaurant_id: 1,
  phone: "...",
  address: "...",
  total_price: "65.50",
  payment_token: "tok_1707644400123_abc...",
  payment_id: "ch_...",
  payment_status: "completed",
  status: "confirmed"
}
```

---

## 📞 الدعم والمشاكل

### إذا كان هناك خطأ:

1. **تحقق من الـ Console Errors**:

```javascript
// لماذا فشل createToken؟
const result = await window.cloverInstance.createToken(cardElement);
console.log(result.errors); // اقرأ الخطأ
```

2. **تحقق من Network Requests**:

```
DevTools → Network Tab
ابحث عن:
- POST /api/payments/token
- POST /api/orders/delivry
اقرأ Response Body
```

3. **تحقق من Laravel Error Log**:

```bash
tail -f storage/logs/laravel.log
# اقرأ أي error messages
```

---

**Happy Testing! 🚀**

# 🚀 دليل استخدام Clover في Production

## 📋 جدول المحتويات

1. [الفرق بين Sandbox و Production](#الفرق-بين-sandbox-و-production)
2. [الانتقال من Sandbox إلى Production](#الانتقال-من-sandbox-إلى-production)
3. [Backend API Structure](#backend-api-structure)
4. [Frontend Implementation](#frontend-implementation)
5. [Environment Variables](#environment-variables)
6. [Best Practices](#best-practices)

---

## 🔄 الفرق بين Sandbox و Production

### Sandbox (التطوير والاختبار)

```
SDK URL: https://checkout.sandbox.dev.clover.com/sdk.js
API URL: https://sandbox.dev.clover.com
Merchant Dashboard: https://sandbox.dev.clover.com/dashboard
```

### Production (الإنتاج الفعلي)

```
SDK URL: https://checkout.clover.com/sdk.js
API URL: https://api.clover.com
Merchant Dashboard: https://www.clover.com/dashboard
```

---

## 🔐 الانتقال من Sandbox إلى Production

### الخطوة 1: احصل على Production Credentials

1. سجل حساب Production في:

   ```
   https://www.clover.com/signup
   ```

2. اذهب إلى Developer Dashboard:

   ```
   https://www.clover.com/appmarket/developer
   ```

3. أنشئ تطبيق جديد واحصل على:
   - ✅ **App ID**
   - ✅ **App Secret**
   - ✅ **Merchant ID** (من الـ Dashboard بعد ربط التطبيق)

4. احصل على **Public Token**:
   ```
   https://www.clover.com/oauth/authorize?client_id=YOUR_APP_ID
   ```

### الخطوة 2: تحديث Environment Variables

#### 🔧 في `.env.local` (Frontend - Next.js):

```env
# وضع التشغيل
NEXT_PUBLIC_ENV_MODE=production

# 🔴 Production Credentials
NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_PROD=YOUR_PRODUCTION_PUBLIC_TOKEN
NEXT_PUBLIC_CLOVER_MERCHANT_ID_PROD=YOUR_PRODUCTION_MERCHANT_ID
NEXT_PUBLIC_CLOVER_API_PROD=https://api.clover.com

# 🟢 Sandbox Credentials (للتطوير فقط)
NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX=af2aab20e19f56b2290797cb60abb149
NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX=YOUR_SANDBOX_MERCHANT_ID
NEXT_PUBLIC_CLOVER_API_SANDBOX=https://sandbox.dev.clover.com

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
# أو للتطوير المحلي:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### 🔧 في `.env` (Backend - Laravel):

```env
# Clover Production
CLOVER_PUBLIC_TOKEN=YOUR_PRODUCTION_PUBLIC_TOKEN
CLOVER_PRIVATE_TOKEN=YOUR_PRODUCTION_PRIVATE_TOKEN
CLOVER_MERCHANT_ID=YOUR_PRODUCTION_MERCHANT_ID
CLOVER_API_URL=https://api.clover.com

# Clover Sandbox (للتطوير)
CLOVER_SANDBOX_PUBLIC_TOKEN=af2aab20e19f56b2290797cb60abb149
CLOVER_SANDBOX_PRIVATE_TOKEN=YOUR_SANDBOX_PRIVATE_TOKEN
CLOVER_SANDBOX_MERCHANT_ID=YOUR_SANDBOX_MERCHANT_ID
CLOVER_SANDBOX_API_URL=https://sandbox.dev.clover.com

# البيئة الحالية
CLOVER_ENV=production
# أو: CLOVER_ENV=sandbox
```

---

## 🏗️ Backend API Structure

### 1. ملف Config للـ Clover

#### 📁 `config/clover.php` (Laravel)

```php
<?php

return [
    'env' => env('CLOVER_ENV', 'sandbox'), // production أو sandbox

    'production' => [
        'public_token' => env('CLOVER_PUBLIC_TOKEN'),
        'private_token' => env('CLOVER_PRIVATE_TOKEN'),
        'merchant_id' => env('CLOVER_MERCHANT_ID'),
        'api_url' => env('CLOVER_API_URL', 'https://api.clover.com'),
        'sdk_url' => 'https://checkout.clover.com/sdk.js',
    ],

    'sandbox' => [
        'public_token' => env('CLOVER_SANDBOX_PUBLIC_TOKEN'),
        'private_token' => env('CLOVER_SANDBOX_PRIVATE_TOKEN'),
        'merchant_id' => env('CLOVER_SANDBOX_MERCHANT_ID'),
        'api_url' => env('CLOVER_SANDBOX_API_URL', 'https://sandbox.dev.clover.com'),
        'sdk_url' => 'https://checkout.sandbox.dev.clover.com/sdk.js',
    ],
];
```

### 2. Service Class للتعامل مع Clover

#### 📁 `app/Services/CloverService.php`

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

class CloverService
{
    private $apiUrl;
    private $privateToken;
    private $merchantId;

    public function __construct()
    {
        $env = config('clover.env');
        $this->apiUrl = config("clover.{$env}.api_url");
        $this->privateToken = config("clover.{$env}.private_token");
        $this->merchantId = config("clover.{$env}.merchant_id");
    }

    /**
     * إنشاء دفعة (Charge) باستخدام Token من Frontend
     */
    public function createCharge($cloverToken, $amount, $orderId)
    {
        $endpoint = "{$this->apiUrl}/v1/charges";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->privateToken}",
            'Content-Type' => 'application/json',
        ])->post($endpoint, [
            'source' => $cloverToken,  // Token من Frontend
            'amount' => $amount * 100, // بالسنت: $10.50 = 1050
            'currency' => 'usd',
            'capture' => true,         // خصم فوري
            'description' => "Order #{$orderId}",
        ]);

        return $response->json();
    }

    /**
     * استرجاع معلومات دفعة
     */
    public function getCharge($chargeId)
    {
        $endpoint = "{$this->apiUrl}/v1/charges/{$chargeId}";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->privateToken}",
        ])->get($endpoint);

        return $response->json();
    }

    /**
     * استرجاع أموال (Refund)
     */
    public function refundCharge($chargeId, $amount = null)
    {
        $endpoint = "{$this->apiUrl}/v1/charges/{$chargeId}/refunds";

        $data = [];
        if ($amount) {
            $data['amount'] = $amount * 100; // بالسنت
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->privateToken}",
            'Content-Type' => 'application/json',
        ])->post($endpoint, $data);

        return $response->json();
    }
}
```

### 3. Controller للدفع

#### 📁 `app/Http/Controllers/PaymentController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Services\CloverService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    private $cloverService;

    public function __construct(CloverService $cloverService)
    {
        $this->cloverService = $cloverService;
    }

    /**
     * معالجة الدفع
     * POST /api/payments/process
     */
    public function processPayment(Request $request)
    {
        // التحقق من البيانات
        $validator = Validator::make($request->all(), [
            'clover_token' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'order_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid data',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // إنشاء الدفعة في Clover
            $charge = $this->cloverService->createCharge(
                $request->clover_token,
                $request->amount,
                $request->order_id
            );

            // التحقق من نجاح الدفع
            if (isset($charge['id']) && $charge['status'] === 'succeeded') {
                // حفظ الدفعة في قاعدة البيانات
                // Order::find($request->order_id)->update([
                //     'payment_status' => 'paid',
                //     'clover_charge_id' => $charge['id'],
                //     'paid_at' => now(),
                // ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
                    'charge_id' => $charge['id'],
                    'amount' => $charge['amount'] / 100,
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment failed',
                'error' => $charge['error'] ?? 'Unknown error',
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment processing error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * استرجاع أموال
     * POST /api/payments/refund
     */
    public function refundPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'charge_id' => 'required|string',
            'amount' => 'nullable|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $refund = $this->cloverService->refundCharge(
                $request->charge_id,
                $request->amount
            );

            return response()->json([
                'success' => true,
                'message' => 'Refund successful',
                'refund' => $refund,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Refund failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
```

### 4. Routes للـ API

#### 📁 `routes/api.php`

```php
<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('payments')->group(function () {
    // معالجة الدفع
    Route::post('/process', [PaymentController::class, 'processPayment']);

    // استرجاع الأموال
    Route::post('/refund', [PaymentController::class, 'refundPayment']);

    // التحقق من حالة الدفع
    Route::get('/status/{chargeId}', [PaymentController::class, 'getPaymentStatus']);
});
```

---

## 💻 Frontend Implementation

### 1. تحديث CloverPayment Component

#### 📁 `components/delivry/CloverPayment.jsx`

```jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import api from "@/api/axiosClient";

const CloverPayment = ({ cartTotal, orderId, onPaymentSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [cloverReady, setCloverReady] = useState(false);
  const [cardError, setCardError] = useState("");

  const cardElementsRef = useRef({});
  const cloverInstanceRef = useRef(null);
  const cloverInitialized = useRef(false);

  // 🔄 اختيار البيئة (Production أو Sandbox)
  const ENV_MODE = process.env.NEXT_PUBLIC_ENV_MODE || "sandbox";
  const IS_PRODUCTION = ENV_MODE === "production";

  // اختيار الـ Credentials حسب البيئة
  const PUBLIC_TOKEN = IS_PRODUCTION
    ? process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_PROD
    : process.env.NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX;

  const MERCHANT_ID = IS_PRODUCTION
    ? process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID_PROD
    : process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX;

  const SDK_URL = IS_PRODUCTION
    ? "https://checkout.clover.com/sdk.js"
    : "https://checkout.sandbox.dev.clover.com/sdk.js";

  // 📦 تحميل Clover SDK
  useEffect(() => {
    let isMounted = true;

    if (cloverInitialized.current) return;

    const loadCloverSDK = () => {
      if (window.Clover) {
        initializeClover();
        return;
      }

      const existingScript = document.getElementById("clover-sdk-script");
      if (existingScript) {
        existingScript.addEventListener("load", initializeClover, {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.id = "clover-sdk-script";
      script.onload = () => {
        if (window.Clover && isMounted) {
          initializeClover();
          cloverInitialized.current = true;
        }
      };
      script.onerror = () => {
        if (isMounted) {
          toast.error("Error loading payment system");
        }
      };
      document.head.appendChild(script);
    };

    loadCloverSDK();

    return () => {
      isMounted = false;
      Object.values(cardElementsRef.current).forEach((element) => {
        if (element && typeof element.destroy === "function") {
          element.destroy();
        }
      });
      cardElementsRef.current = {};
      cloverInstanceRef.current = null;
    };
  }, [SDK_URL]);

  // 🔧 تهيئة Clover Elements
  const initializeClover = () => {
    try {
      if (cloverInitialized.current) return;

      if (!PUBLIC_TOKEN || !MERCHANT_ID) {
        console.error("Missing Clover credentials");
        toast.error("Payment configuration error");
        return;
      }

      const clover = new window.Clover(PUBLIC_TOKEN, {
        merchantId: MERCHANT_ID,
      });

      const elements = clover.elements();

      const style = {
        style: {
          base: {
            fontSize: "16px",
            color: "#1f2937",
            "::placeholder": { color: "#9ca3af" },
          },
          invalid: { color: "#dc2626" },
        },
      };

      const cardNumber = elements.create("CARD_NUMBER", style);
      const cardDate = elements.create("CARD_DATE", style);
      const cardCvv = elements.create("CARD_CVV", style);
      const cardPostalCode = elements.create("CARD_POSTAL_CODE", style);

      // Event listeners للـ validation
      const attachValidationListeners = (element) => {
        if (!element || typeof element.addEventListener !== "function") return;

        const handleEvent = (event) => {
          if (event?.error) {
            setCardError(event.error.message || event.error);
          } else if (event?.complete) {
            setCardError("");
          }
        };

        element.addEventListener("change", handleEvent);
        element.addEventListener("blur", handleEvent);
      };

      attachValidationListeners(cardNumber);
      attachValidationListeners(cardDate);
      attachValidationListeners(cardCvv);
      attachValidationListeners(cardPostalCode);

      // Mount العناصر
      cardNumber.mount("#card-number");
      cardDate.mount("#card-date");
      cardCvv.mount("#card-cvv");
      cardPostalCode.mount("#card-postal-code");

      cardElementsRef.current = {
        cardNumber,
        cardDate,
        cardCvv,
        cardPostalCode,
      };
      cloverInstanceRef.current = clover;
      cloverInitialized.current = true;
      setCloverReady(true);

      console.log(`✅ Clover (${ENV_MODE}) initialized successfully`);
    } catch (error) {
      console.error("Error initializing Clover:", error);
      toast.error("Error initializing payment");
    }
  };

  // 💳 معالجة الدفع
  const handlePayment = async () => {
    if (!cloverReady || !cloverInstanceRef.current) {
      toast.error("Payment system not ready");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ الحصول على Token من Clover
      const result = await cloverInstanceRef.current.createToken();

      if (result?.errors?.length > 0) {
        const errorMessage = result.errors
          .map((err) => err.message || err)
          .join(", ");
        setCardError(errorMessage);
        toast.error(`Card error: ${errorMessage}`);
        setLoading(false);
        return;
      }

      if (!result.token) {
        toast.error("Failed to create payment token");
        setLoading(false);
        return;
      }

      const cloverToken = result.token;
      console.log("✅ Clover token created:", cloverToken);

      // 2️⃣ إرسال Token للـ Backend
      const response = await api().post("/payments/process", {
        clover_token: cloverToken,
        amount: cartTotal,
        order_id: orderId,
      });

      if (response.data.success) {
        toast.success("✅ Payment successful!");

        // استدعاء callback
        if (onPaymentSuccess) {
          onPaymentSuccess({
            chargeId: response.data.charge_id,
            amount: response.data.amount,
          });
        }
      } else {
        toast.error(response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Secure Payment</h2>

        {/* Environment Badge */}
        <div className="mb-4">
          <span
            className={`px-2 py-1 rounded text-xs ${
              IS_PRODUCTION
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {IS_PRODUCTION ? "🔴 LIVE" : "🟡 TEST MODE"}
          </span>
        </div>

        {/* Card Elements */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Card Number
            </label>
            <div id="card-number" className="border rounded p-3 min-h-[44px]" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry</label>
              <div id="card-date" className="border rounded p-3 min-h-[44px]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <div id="card-cvv" className="border rounded p-3 min-h-[44px]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP</label>
              <div
                id="card-postal-code"
                className="border rounded p-3 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {cardError && <p className="text-red-600 text-sm mt-2">{cardError}</p>}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={!cloverReady || loading}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay $${cartTotal}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloverPayment;
```

---

## 🔐 Environment Variables - ملخص

### Frontend (`.env.local`):

```env
# البيئة: production أو sandbox
NEXT_PUBLIC_ENV_MODE=production

# Production
NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_PROD=your_prod_token
NEXT_PUBLIC_CLOVER_MERCHANT_ID_PROD=your_prod_merchant_id

# Sandbox
NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN_SANDBOX=your_sandbox_token
NEXT_PUBLIC_CLOVER_MERCHANT_ID_SANDBOX=your_sandbox_merchant_id

# Backend
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Backend (`.env`):

```env
# Production
CLOVER_PUBLIC_TOKEN=your_prod_public_token
CLOVER_PRIVATE_TOKEN=your_prod_private_token
CLOVER_MERCHANT_ID=your_prod_merchant_id
CLOVER_API_URL=https://api.clover.com

# Environment
CLOVER_ENV=production
```

---

## ✅ Best Practices

### 1. الأمان (Security)

- ❌ **لا تضع Private Token في Frontend أبداً**
- ✅ استخدم Private Token في Backend فقط
- ✅ استخدم HTTPS في Production
- ✅ تحقق من البيانات في Backend قبل معالجة الدفع

### 2. معالجة الأخطاء

```javascript
try {
  const response = await api().post("/payments/process", data);
  // handle success
} catch (error) {
  if (error.response?.status === 422) {
    // Validation error
  } else if (error.response?.status === 400) {
    // Payment failed
  } else {
    // Server error
  }
}
```

### 3. Webhooks (اختياري)

قم بإعداد Webhook في Clover لتلقي إشعارات عن:

- نجاح الدفع
- فشل الدفع
- Chargebacks
- Refunds

```
Webhook URL: https://yourdomain.com/api/webhooks/clover
```

### 4. Logging

احفظ جميع transactions في قاعدة البيانات:

- Charge ID
- Order ID
- Amount
- Status
- Created At

---

## 🔄 ملخص الـ Flow الكامل

```
┌──────────────┐
│   Frontend   │
│  (Next.js)   │
└──────┬───────┘
       │ 1. User enters card
       │ 2. Clover SDK creates token
       │
       ▼
┌──────────────────┐
│ Clover SDK       │  Token: "tok_abc123..."
│ (client-side)    │
└──────┬───────────┘
       │ 3. Send token to backend
       │
       ▼
┌──────────────────┐
│  Backend API     │
│  (Laravel)       │  POST /api/payments/process
└──────┬───────────┘
       │ 4. Create charge with token
       │
       ▼
┌──────────────────┐
│  Clover API      │  POST /v1/charges
│  (Production)    │  Authorization: Bearer {private_token}
└──────┬───────────┘
       │ 5. Return charge result
       │
       ▼
┌──────────────────┐
│  Backend saves   │  - Charge ID
│  to database     │  - Status
└──────┬───────────┘  - Amount
       │ 6. Return success to frontend
       │
       ▼
┌──────────────────┐
│  Frontend shows  │  "Payment Successful! ✅"
│  success message │
└──────────────────┘
```

---

## 📚 روابط مهمة

- **Clover Dashboard**: https://www.clover.com/dashboard
- **Developer Docs**: https://docs.clover.com
- **API Reference**: https://docs.clover.com/reference
- **Test Cards**: https://docs.clover.com/docs/test-card-numbers

---

## 🆘 الدعم والمساعدة

إذا واجهت أي مشاكل:

1. تحقق من الـ Console في المتصفح
2. تحقق من Logs في Backend
3. تحقق من Clover Dashboard
4. راجع [TESTING_CLOVER.md](./TESTING_CLOVER.md) للمشاكل الشائعة

---

**✅ جاهز للإنتاج!** 🚀

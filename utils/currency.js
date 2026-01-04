// utils/currency.js
export async function convertCurrency(amount, from = "SAR", to = "USD") {
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/${from}`
    );
    const data = await res.json();

    if (!data || !data.conversion_rates[to]) {
      throw new Error("Currency not supported");
    }

    const rate = data.conversion_rates[to];
    return (amount * rate).toFixed(2); // المبلغ بعد التحويل
  } catch (error) {
    console.error("Error converting currency:", error);
    return amount; // fallback = المبلغ الأصلي
  }
}

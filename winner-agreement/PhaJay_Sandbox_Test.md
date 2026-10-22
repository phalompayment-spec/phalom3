# PhaJay sandbox test (23 Oct 2026)

The team opened a free PhaJay portal account (https://portal.phajay.co, no KYC) and used its **Test Key** against PhaJay's sandbox. No real money moved. The key is **not** in this repo. Give it to the script through the `PHAJAY_TEST_KEY` environment variable only.

Script: `pitch/phalom-app/scripts/phajay-sandbox.mjs` (see the comments at the top for how to run it).

## What worked

| Test | Endpoint | Result |
|---|---|---|
| Bank QR: BCEL, JDB, LDB, IB | `POST /v1/api/test/payment/generate-{bank}-qr`, header `secretKey: <test key>` | 200 `SUCCESS`, returns `qrCode`, `transactionId`, `link` (`phapay://qr/...` deeplink) |
| Payment link (hosted page, tourist picks a bank) | `POST /v1/api/test/payment/get-payment-link`, header `Authorization: Basic base64(key)` | 200, returns `redirectURL` on `payment-link.sandbox.phajay.co` |

## What we learned

- **The sandbox is a mock.** Every test QR, whatever the bank, carries the same BCEL test merchant, so it proves nothing about real bank routing. Pay test QRs only with the **PhaJay test app** (https://payment-doc.phajay.co/v1/sandbox/phajay-app). Real bank apps won't pay them.
- **STB, APB and M-Money have no sandbox** (404). The docs list STB anyway.
- **The status check doesn't see sandbox payments.** `GET /v1/api/payment/check-transaction/status/:id` answers `PAYMENT_NOT_FOUND` for test transactions, and `/test/...` has no status endpoint. So in the sandbox, the only way to learn "paid" is PhaJay's **webhook** (set the URL in the portal under Settings → Webhook) or its Socket.IO event `join::<key>`.
- **Webhook format** (from the docs): JSON `POST` with header `X-Signature` = Base64 HMAC-SHA256 of the raw body. Before KYC it's signed with the `devSecretKey`, after KYC with the `secretKey`. Fields include `transactionId`, `txnAmount`, `status: "PAYMENT_COMPLETED"`, `paymentMethod`, `refNo` and `tag1`–`tag6`. A real payment counts only when `status` is `PAYMENT_COMPLETED` (and `isPaid` is true on the status check).
- Our app's webhook (`POST /api/webhooks/payment`) uses its **own** format and signature today. To accept PhaJay it needs a small adapter that checks `X-Signature` and maps `transactionId`/`tag` back to our payment.
- **Alipay, WeChat Pay, cards and Thai/Chinese tourist wallets are not in the sandbox.** Those are the main reason Phalom exists, so we still have to ask PhaJay how a foreign wallet pays a Lao merchant and what reaches the shop (kip, fee).
- Bank descriptions: plain ASCII, short (BCEL refuses Lao/Thai text, APB wants under 25 characters).

## Next steps (free)

1. Install the PhaJay test app, run `qr bcel 10000`, scan, and see whether the payment completes.
2. Point the portal's webhook at a test URL to see a real sandbox webhook and signature, then add the adapter to our webhook.
3. Ask PhaJay's developer contact (WhatsApp in their docs) about foreign wallets in the sandbox and about partner/revenue share.

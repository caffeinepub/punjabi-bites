# Specification

## Summary
**Goal:** Fix UPI payment deep links so that clicking GPay, PhonePe, and Paytm buttons opens the correct respective payment app instead of WhatsApp.

**Planned changes:**
- Update `UpiPaymentButtons.tsx` to use correct UPI URI schemes: `tez://upi/pay?` for GPay, `phonepe://pay?` for PhonePe, and `paytmmp://pay?` for Paytm
- Update `UpiPaymentOptionsModal.tsx` with the same corrected URI schemes if it also builds deep links

**User-visible outcome:** Clicking GPay, PhonePe, or Paytm payment buttons now opens the correct payment app instead of WhatsApp.

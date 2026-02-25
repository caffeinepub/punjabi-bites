# Specification

## Summary
**Goal:** Fix intermittent "failed to show menu" and payment options errors in the Punjabi Bites app by adding robust error handling, retry logic, and a global error boundary.

**Planned changes:**
- Add retry logic (at least 3 retries with backoff) to the React Query hook for menu items in `MenuDisplay.tsx`, and show a user-friendly error state with a "Try Again" button and loading skeleton when data fails to load
- Add retry logic to the React Query hook for the payment QR code in `PaymentPage.tsx`, and show a fallback error UI with a retry button when the QR code or payment options fail to load; handle loading and error states in `PaymentQRCodeModal` as well
- Add a global React error boundary component wrapping main route content in `App.tsx` that displays a branded error screen with a "Reload" button on unhandled rendering errors
- Audit and fix the backend Motoko `getMenuItems` and `getPaymentQRCode` query functions to always return valid responses (empty array or null) without trapping under concurrent load or empty state conditions

**User-visible outcome:** The food menu and payment options load reliably on repeated visits; when a transient failure occurs, users see a clear error message with a retry option instead of a blank screen or cryptic error.

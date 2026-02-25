# Specification

## Summary
**Goal:** Fix the Pay Now button visibility in CartSidebar and add a fallback message on PaymentPage when UPI settings are missing.

**Planned changes:**
- Fix the Pay Now button in CartSidebar so it is visible and functional on all devices (mobile and desktop) when the cart contains at least one item, resolving any CSS, conditional rendering, z-index, or overflow issues hiding it.
- Audit the PaymentPage UPI settings fetch and display a user-friendly fallback message (e.g., "Payment is currently unavailable. Please contact the restaurant.") when UPI settings are missing or empty, instead of a blank or broken UI.

**User-visible outcome:** Users can see and tap the Pay Now button in the cart on all devices, and will see a clear message if payment is currently unavailable rather than a blank screen.

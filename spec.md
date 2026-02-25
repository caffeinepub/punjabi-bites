# Specification

## Summary
**Goal:** Add a shopping cart and checkout flow to the Punjabi Bites menu page, allowing customers to select multiple items and pay via QR code.

**Planned changes:**
- Add an "Add to Cart" button on each available MenuItemCard (disabled/hidden for sold-out items)
- Create a CartContext (or lifted state) to manage cart state across components without prop-drilling
- Add a persistent floating cart summary component showing selected items, quantities, line totals, and grand total
- Allow users to increment, decrement, or remove items from the cart
- Add a "Checkout" button in the cart that opens the existing PaymentQRCodeModal with order summary and QR code
- Disable the Checkout button when the cart is empty
- Reset cart state after the checkout modal is closed

**User-visible outcome:** Customers can add multiple menu items to a cart, review their order with a running total, and proceed to checkout where a QR code is displayed for payment.

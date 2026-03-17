# Auth Registration Bug Report
**Date**: 2026-03-18 06:10 WIB

## The Problem
Paid users (e.g. `dragon11@yahoo.com`) could NOT log in despite being in `global_product` (PAID) and `saham_clients` (active). They were missing from **Neon Auth** — the actual authentication system.

---

## Root Cause #1: `tripay-callback.js` never registered users in Neon Auth

### ❌ WRONG (old code)
```javascript
// tripay-callback.js — Fulfillment Phase
// Only inserted into saham_clients. NEVER touched Neon Auth.
await sql`
  INSERT INTO saham_clients (user_email, ...) VALUES (...)
`;
// User is in saham_clients ✅
// User is in Neon Auth ❌ — CANNOT LOGIN
```

### ✅ CORRECT (fixed code)
```javascript
// STEP 1: Register in Neon Auth FIRST
await fetch(`${authUrl}/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});
// User is in Neon Auth ✅ — CAN LOGIN

// STEP 2: Then insert into saham_clients
await sql`
  INSERT INTO saham_clients (user_email, ...) VALUES (...)
`;
// User is in saham_clients ✅
```

---

## Root Cause #2: `Auth.tsx` fallback logic was dead code

The fallback was supposed to auto-register users in Neon Auth when they try to log in. But it **never ran**.

### ❌ WRONG (old code)
```typescript
try {
  const result = await authClient.signIn.email({ email, password });
  // ^^^ THIS THROWS AN EXCEPTION ON 401 ^^^
  
  if (result.error) {
    // ^^^ THIS NEVER EXECUTES because the exception
    //     already jumped to the catch block below ^^^
    
    // ... fallback auto-registration logic ...
    // ... ALL OF THIS IS DEAD CODE ...
  }
} catch (error) {
  // Lands here immediately. Shows "Email atau password salah."
  // Fallback never ran.
  toast.error("Email atau password salah.");
}
```

### ✅ CORRECT (fixed code)
```typescript
try {
  // Wrap signIn in its OWN try-catch
  let signInError = null;
  try {
    signInResult = await authClient.signIn.email({ email, password });
  } catch (err) {
    signInError = err; // Catch the 401 throw
  }

  // NOW the fallback actually runs
  if (signInError) {
    // Check global_product for PAID status
    const paid = await sql`SELECT * FROM global_product WHERE email = ... AND status = 'PAID'`;
    
    if (paid.length > 0) {
      // Register in Neon Auth
      await authClient.signUp.email({ email, password, name });
      // Sign in
      await authClient.signIn.email({ email, password });
      // Insert into saham_clients
      await sql`INSERT INTO saham_clients ...`;
      // Redirect to dashboard ✅
    }
  }
} catch (error) {
  // Only truly unexpected errors land here
}
```

---

## Summary Table

| Where | What was wrong | Fix |
|-------|---------------|-----|
| `tripay-callback.js` | Never called Neon Auth sign-up endpoint | Added `fetch()` to `/sign-up/email` |
| `Auth.tsx` | `signIn` throws exception, fallback skipped | Wrapped `signIn` in its own try-catch |
| `Auth.tsx` | Used `product.address` as password | Changed to `product.password` |

## The Simple Rule
> **Anyone who is PAID or in saham_clients MUST also be in Neon Auth.**
> - Payment callback → register in Neon Auth
> - Login fallback → if not in Neon Auth but paid/active → auto-register in Neon Auth
> - Sign up form → register in Neon Auth + saham_clients

## Files Modified
- `api/tripay-callback.js` — Added Neon Auth registration on payment
- `src/pages/Auth.tsx` — Fixed exception handling so fallback actually runs

# Auth Foundation

Future strategy for protected routes:

1. **Token storage:** Prefer httpOnly cookies (set by API) for refresh token; access token in memory or short-lived cookie
2. **Protected routes:** Middleware checks for valid token; redirect to `/login` if unauthenticated
3. **Role-based:** After auth, check `user.role` for CUSTOMER / MASTER / ADMIN; redirect to appropriate dashboard
4. **Token refresh:** Intercept 401, call refresh endpoint, retry request; if refresh fails, redirect to login

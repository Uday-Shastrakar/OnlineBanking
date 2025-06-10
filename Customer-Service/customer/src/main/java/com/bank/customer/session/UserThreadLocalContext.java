package com.bank.customer.session;



public class UserThreadLocalContext {

    private static final ThreadLocal<UserSession> userSessionThreadLocal = new ThreadLocal<>();

    // Set the UserSession into the ThreadLocal
    public static void setUserSession(UserSession userSession) {
        userSessionThreadLocal.set(userSession);
    }

    // Get the UserSession from the ThreadLocal
    public static UserSession getUserSession() {
        return userSessionThreadLocal.get();
    }

    // Clear the UserSession from the ThreadLocal to prevent memory leaks
    public static void clear() {
        userSessionThreadLocal.remove();
    }
}

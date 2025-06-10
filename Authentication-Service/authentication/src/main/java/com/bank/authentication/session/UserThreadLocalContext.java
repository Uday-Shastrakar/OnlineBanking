package com.bank.authentication.session;

public class UserThreadLocalContext {
    private static final ThreadLocal<UserSession> userSessionThreadLocal = new ThreadLocal<>();

    public static UserSession getUserSession() {
        return userSessionThreadLocal.get();
    }

    public static void setUserSession(UserSession userSession) {
        userSessionThreadLocal.set(userSession);
    }

    public static void clear() {
        userSessionThreadLocal.remove();
    }
}

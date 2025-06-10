package com.bank.authentication.audit;

public class AuditContext {
    private static final ThreadLocal<String> ipAddress = new ThreadLocal<>();
    private static final ThreadLocal<String> userAgent = new ThreadLocal<>();
    private static final ThreadLocal<String> acceptLanguage = new ThreadLocal<>();
    private static final ThreadLocal<String> referer = new ThreadLocal<>();
    private static final ThreadLocal<String> correlationId = new ThreadLocal<>();

    public static void setIpAddress(String ip) {
        ipAddress.set(ip);
    }

    public static void setUserAgent(String agent) {
        userAgent.set(agent);
    }

    public static void setAcceptLanguage(String language) {
        acceptLanguage.set(language);
    }

    public static void setReferer(String ref) {
        referer.set(ref);
    }

    public static void setCorrelationId(String requestId) {
        correlationId.set(requestId);
    }

    public static String getIpAddress() {
        return ipAddress.get();
    }

    public static String getUserAgent() {
        return userAgent.get();
    }

    public static String getAcceptLanguage() {
        return acceptLanguage.get();
    }

    public static String getReferer() {
        return referer.get();
    }

    public static String getCorrelationId() {
        return correlationId.get();
    }

    public static void clear() {
        ipAddress.remove();
        userAgent.remove();
        acceptLanguage.remove();
        referer.remove();
        correlationId.remove();
    }
}

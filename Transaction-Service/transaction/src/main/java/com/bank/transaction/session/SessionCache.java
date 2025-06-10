package com.bank.transaction.session;

import java.util.concurrent.ConcurrentHashMap;

public class SessionCache {

    private static final ConcurrentHashMap<String, UserSession> sessionCache = new ConcurrentHashMap<>();

    public static void storeSession(String sessionId, UserSession session){
        sessionCache.put(sessionId, session);
    }


}

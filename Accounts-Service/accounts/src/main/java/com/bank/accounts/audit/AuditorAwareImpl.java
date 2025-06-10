package com.bank.accounts.audit;

import com.bank.accounts.session.UserSession;
import com.bank.accounts.session.UserThreadLocalContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {
    private static final Logger logger = LoggerFactory.getLogger(AuditorAwareImpl.class);

    @Override
    public Optional<String> getCurrentAuditor() {
        UserSession userSession = UserThreadLocalContext.getUserSession();
        String auditorEmail = (userSession != null) ? userSession.email() : "system"; // Default to "system"
        logger.info("Current auditor: {}", auditorEmail);
        return Optional.of(auditorEmail);
    }
}
package com.bank.authentication.service;

import com.bank.authentication.model.PasswordResetToken;
import com.bank.authentication.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PasswordResetTokenService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    public PasswordResetTokenService(PasswordResetTokenRepository passwordResetTokenRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    public PasswordResetToken save(PasswordResetToken token) {
        passwordResetTokenRepository.save(token);
        return token;
    }

    public Optional<PasswordResetToken> getToken(String token) {
        return passwordResetTokenRepository.findByToken(token);
    }

    public void deleteToken(Long tokenId) {
        passwordResetTokenRepository.deleteById(tokenId);
    }

    public void deleteToken(String token) {
        passwordResetTokenRepository.deleteByToken(token);
    }
}

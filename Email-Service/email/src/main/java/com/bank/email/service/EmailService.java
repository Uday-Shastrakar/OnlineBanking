package com.bank.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromMail;

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String title, String message)
            throws MessagingException {
        try {
            Context context = new Context();
            context.setVariable("title", title);
            context.setVariable("message", message.replace("\n", "<br/>"));

            String htmlContent = templateEngine.process("notification-email", context);
            sendMail(toEmail, subject, htmlContent, true);
            logger.info("✅ Notification HTML email successfully sent to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("❌ Error sending notification email: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Async
    public void sendSimpleMail(String toEmail, String subject, String content) throws MessagingException {
        try {
            sendMail(toEmail, subject, content, false);
            logger.info("✅ Simple email successfully sent to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("❌ Error sending simple email: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp) throws MessagingException {
        try {
            String subject = "Your OTP Code";

            // Prepare Thymeleaf context with OTP variable
            Context context = new Context();
            context.setVariable("otp", otp);

            // Process the Thymeleaf template
            String htmlContent = templateEngine.process("otp-email", context);

            // ✅ Debugging log to check generated HTML
            logger.info("Generated OTP Email Content:\n{}", htmlContent);

            // Send the email
            sendMail(toEmail, subject, htmlContent, true);
            logger.info("✅ OTP email successfully sent to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("❌ Error sending OTP email: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Async
    public void sendEmailWithAttachment(String toEmail, String subject, String text, byte[] attachment,
            String attachmentName) throws MessagingException {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);

            messageHelper.setFrom(fromMail);
            messageHelper.setTo(toEmail);
            messageHelper.setSubject(subject);
            messageHelper.setText(text);

            // Attach the generated PDF using ByteArrayResource
            ByteArrayResource resource = new ByteArrayResource(attachment);
            messageHelper.addAttachment(attachmentName, resource);

            mailSender.send(mimeMessage);
            logger.info("✅ Email sent with attachment: {}", attachmentName);
        } catch (MessagingException e) {
            logger.error("❌ Error sending email with attachment: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Async
    private void sendMail(String toEmail, String subject, String message, boolean isHTML) throws MessagingException {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

            mimeMessageHelper.setFrom(fromMail);
            mimeMessageHelper.setTo(toEmail);
            mimeMessageHelper.setSubject(subject);
            mimeMessageHelper.setText(message, isHTML); // ✅ Fixed: HTML support

            mailSender.send(mimeMessage);
            logger.info("✅ Email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("❌ Error sending email: {}", e.getMessage(), e);
            throw e;
        }
    }
}

package com.bank.authentication.extenalservice;

import com.bank.authentication.feignclient.EmailSenderService;
import com.bank.authentication.feignclient.OtpRequest;
import lombok.AllArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Service
@Setter
@AllArgsConstructor
public class EmailService {

    private final EmailSenderService emailSenderService;

    public void sendOtpEmail(String email, String otp) {
        OtpRequest req = new OtpRequest();
        req.setOtp(otp);
        req.setToEmail(email); // Assuming 'toEmail' should be 'email'

        // Implement the email sending logic here
        try {
            String result = emailSenderService.sendOtpEmail(req);
            System.out.println(result);
        } catch (Exception e) {
            System.out.println(e);
        }
        // Example:
        String subject = "Your Password Reset OTP";
        String message = "Your OTP for password reset is: " + otp;
        System.out.println("subject : " + subject + "To " + email + "\n " + "Message :" + message);
        // Use your mail sender to send the email

    }
}

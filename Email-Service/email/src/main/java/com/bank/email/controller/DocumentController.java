package com.bank.email.controller;

import com.bank.email.service.PdfGeneratorService;
import com.bank.email.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/document")
@RequiredArgsConstructor
public class DocumentController {

    private final PdfGeneratorService pdfGeneratorService;
    private final EmailService emailService;

    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(@RequestBody AgreementData agreementData) {
        try {
            if (Objects.isNull(agreementData) || agreementData.getProjectTitle() == null) {
                logger.warn("Received invalid AgreementData: {}", agreementData);
                return ResponseEntity.badRequest().body(null);
            }

            logger.info("Generating PDF for Agreement Data: {}", agreementData);

            // Generate PDF
            byte[] pdfBytes = pdfGeneratorService.generatePdf(agreementData);
            logger.info("PDF generated successfully for project: {}", agreementData.getProjectTitle());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=agreement.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            logger.error("Error generating PDF: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(null);
        }
    }

    @PostMapping("/send-email")
    public ResponseEntity<String> sendEmailWithPdf(@RequestBody AgreementData agreementData) {
        try {
            if (Objects.isNull(agreementData) || agreementData.getCompanyRepresentativeName() == null) {
                logger.warn("Invalid AgreementData received for email: {}", agreementData);
                return ResponseEntity.badRequest().body("Invalid data.");
            }

            logger.info("Received Agreement Data for email: {}", agreementData);

            // Generate PDF bytes
            byte[] pdfBytes = pdfGeneratorService.generatePdf(agreementData);
            logger.info("PDF generated for email - Project: {}", agreementData.getProjectTitle());

            // Extract recipient email dynamically
            String recipientEmail = agreementData.getCompanyRepresentativeEmail();
            if (recipientEmail == null || recipientEmail.isEmpty()) {
                logger.warn("Recipient email is missing in AgreementData: {}", agreementData);
                return ResponseEntity.badRequest().body("Recipient email is required.");
            }

            // Send email with attachment
            emailService.sendEmailWithAttachment(
                    recipientEmail,
                    "Agreement Document for " + agreementData.getProjectTitle(),
                    "Dear " + agreementData.getCompanyRepresentativeName() + ",\n\nPlease find the attached agreement document.\n\nBest Regards.",
                    pdfBytes,
                    "agreement.pdf"
            );

            logger.info("Email sent successfully to {}", recipientEmail);
            return ResponseEntity.ok("Email sent successfully to " + recipientEmail);
        } catch (Exception e) {
            logger.error("Error generating PDF or sending email: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error generating PDF or sending email.");
        }
    }

    @Data
    public static class AgreementData {
        private String effectiveDate;
        private String voiceOverArtistName;
        private String voiceOverArtistAddress;
        private String voiceOverArtistPAN;
        private String voiceOverArtistGST;
        private String companyName;
        private String companyRepresentativeName;
        private String companyRepresentativeDesignation;
        private String companyRepresentativeEmail;  // Added recipient email
        private String projectTitle;
        private List<RecordingDetails> recordings;
    }

    @Data
    public static class RecordingDetails {
        private String numberOfRecordings;
        private String projectTitle;
        private String language;
        private String voiceoverArtist;
        private String scriptBy;
        private String duration;
    }
}

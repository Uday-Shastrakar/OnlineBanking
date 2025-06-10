package com.bank.customer.models;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Date;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Customers extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String gender;
    private String address;
    private Date dateOfBirth;
    private String status;
    private Long userId;

    @Lob
    private byte[] proofOfAddress;

    @PrePersist
    protected void prePersist() {super.prePersist();}

    @PreUpdate
    protected void preUpdate() {
        super.preUpdate();
    }

}

package com.bank.customer.dto;

import com.bank.customer.models.Customers;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerDTO {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String email;
    private String gender;
    private String address;
    private LocalDate dateOfBirth;
    private String status;
    private String accountType;

    public CreateCustomerDTO(Long id, Long userId, String firstName, String lastName, String phoneNumber, String email, String gender, String address, LocalDate dateOfBirth, String status ) {
        this.id = id;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.gender = gender;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.status = status;


    }

}

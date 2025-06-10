package com.bank.authentication.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCustomerCredentialsDTO {

    private Long id;

    private String email;

    private String phoneNumber;

    @Override
    public String toString() {
        return "CreateCustomerCredentialsDTO{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                '}';
    }
}

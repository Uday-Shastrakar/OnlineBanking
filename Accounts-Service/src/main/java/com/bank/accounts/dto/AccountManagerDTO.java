package com.bank.accounts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountManagerDTO {

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;
}

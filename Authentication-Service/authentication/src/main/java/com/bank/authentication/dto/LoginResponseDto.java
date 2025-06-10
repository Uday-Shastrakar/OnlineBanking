package com.bank.authentication.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LoginResponseDto {

    private String jwtToken;
    private String userName;
    private List<String> authorities;
    private Long userId;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;

    public LoginResponseDto(String userName, List<String> authorities, String jwtToken,Long userId, String email,String phoneNumber,String firstName,String lastName) {
        this.jwtToken = jwtToken;
        this.userName = userName;
        this.authorities = authorities;
        this.userId = userId;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

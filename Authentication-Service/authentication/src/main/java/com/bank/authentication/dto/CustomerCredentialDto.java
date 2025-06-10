package com.bank.authentication.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class CustomerCredentialDto {

    private Long userId;
    private String username;
    private String password;
    private String email;
    private Set<RoleDto> roles;
    private Set<PermissionDto> permissions;
}


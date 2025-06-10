package com.bank.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class PermissionDto {
    private Long permissionId;
    private String permissionName;
}

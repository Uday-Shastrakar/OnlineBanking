package com.bank.accounts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseDto {

    private Long id;

    private LocalDateTime createdAt;

    private LocalDateTime updateAt;
}

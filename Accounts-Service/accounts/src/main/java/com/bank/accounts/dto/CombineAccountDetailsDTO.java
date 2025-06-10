package com.bank.accounts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CombineAccountDetailsDTO {

    private Long senderAccountNumber;

    private BigDecimal senderAccountBalance;

    private Long senderAccountId;

    private Long receiverAccountNumber;

    private BigDecimal receiverAccountBalance;

    private Long receiverAccountId;
}

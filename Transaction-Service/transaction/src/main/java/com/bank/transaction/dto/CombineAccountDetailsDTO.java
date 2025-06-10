package com.bank.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class CombineAccountDetailsDTO {

    private Long senderAccountNumber;

    private BigDecimal senderAccountBalance;

    private Long senderAccountId;

    private Long receiverAccountNumber;

    private BigDecimal receiverAccountBalance;

    private Long receiverAccountId;
}

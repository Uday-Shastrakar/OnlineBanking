package com.bank.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateAccountDetails {

        private BigDecimal senderAccountBalance;
        private Long senderAccountId;
        private BigDecimal receiverAccountBalance;
        private Long receiverAccountId;

}

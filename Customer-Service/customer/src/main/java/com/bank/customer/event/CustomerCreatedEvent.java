package com.bank.customer.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerCreatedEvent {
    private Long userId;
    private Long customerId;
    private String email;
    private String firstName;
    private String lastName;
}

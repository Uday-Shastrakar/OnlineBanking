    package com.bank.authentication.dto;

    import lombok.Getter;
    import lombok.Setter;

    import java.util.Set;

    @Getter
    @Setter
    public class CustomerCredentialRequestDTO {
        private String username;
        private String password;
        private String email;
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private Set<String> roleNames;
        private Set<String> permissionNames;

        private CreateCustomerDto createCustomerDto;
    }

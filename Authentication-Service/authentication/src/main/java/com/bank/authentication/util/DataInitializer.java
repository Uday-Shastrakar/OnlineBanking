package com.bank.authentication.util;

import com.bank.authentication.model.Permission;
import com.bank.authentication.model.Role;
import com.bank.authentication.model.User;
import com.bank.authentication.repository.PermissionRepository;
import com.bank.authentication.repository.RoleRepository;
import com.bank.authentication.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;

import java.util.Set;

@Component
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository, RoleRepository roleRepository,
            PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // 1. Initialize Roles from BankUserRole enum
                initializeRoles(roleRepository);

                // 2. Initialize Legacy Roles for compatibility
                ensureLegacyRoles(roleRepository);

                // 3. Initialize Granular Permissions
                initializePermissions(permissionRepository);

                // 4. Create the admin user with ADMIN role
                ensureAdminUser(userRepository, roleRepository, permissionRepository, passwordEncoder);

                // 5. Create a staff user
                ensureStaffUser(userRepository, roleRepository, permissionRepository, passwordEncoder);

                // 6. Create an auditor user
                ensureAuditorUser(userRepository, roleRepository, permissionRepository, passwordEncoder);

                logger.info("Server Started Successfully and Data Initialized (Banking Model)");
            } catch (Exception e) {
                logger.error("Error during data initialization", e);
            }
        };
    }

    private void initializeRoles(RoleRepository roleRepository) {
        String[] coreRoles = { "CUSTOMER", "BANK_STAFF", "ADMIN", "AUDITOR", "SYSTEM" };
        for (String roleName : coreRoles) {
            if (!roleRepository.existsByRoleName(roleName)) {
                Role role = new Role(roleName);
                role.setDescription("Core Banking Role: " + roleName);
                roleRepository.save(role);
                logger.info("Created role: {}", roleName);
            }
        }
    }

    private void ensureLegacyRoles(RoleRepository roleRepository) {
        String[] legacyRoles = { "USER" };
        for (String roleName : legacyRoles) {
            if (!roleRepository.existsByRoleName(roleName)) {
                roleRepository.save(new Role(roleName));
                logger.info("Created legacy role: {}", roleName);
            }
        }
    }

    private void initializePermissions(PermissionRepository permissionRepository) {
        String[] permissions = {
                // Customer permissions
                "PERMISSION_CUSTOMER_LOGIN", "PERMISSION_CUSTOMER_VIEW_BALANCE",
                "PERMISSION_CUSTOMER_VIEW_TRANSACTIONS", "PERMISSION_CUSTOMER_TRANSFER_OWN",
                "PERMISSION_CUSTOMER_TRANSFER_EXTERNAL", "PERMISSION_CUSTOMER_UPDATE_PROFILE",
                // Staff permissions
                "PERMISSION_STAFF_LOGIN", "PERMISSION_STAFF_VIEW_CUSTOMER_PROFILE",
                "PERMISSION_STAFF_VIEW_ACCOUNT_METADATA", "PERMISSION_STAFF_CUSTOMER_ASSISTANCE",
                // Admin permissions
                "PERMISSION_ADMIN_LOGIN", "PERMISSION_ADMIN_MANAGE_USERS",
                "PERMISSION_ADMIN_BLOCK_ACCOUNTS", "PERMISSION_ADMIN_VIEW_METRICS",
                "PERMISSION_ADMIN_ACCESS_AUDIT", "PERMISSION_ADMIN_MANAGE_CONFIG",
                // Auditor permissions
                "PERMISSION_AUDITOR_LOGIN", "PERMISSION_AUDITOR_VIEW_AUDIT_LOGS",
                "PERMISSION_AUDITOR_TRACE_TRANSACTIONS", "PERMISSION_AUDITOR_EXPORT_REPORTS",
                // Legacy permissions
                "PERMISSION_READ", "PERMISSION_WRITE"
        };

        for (String permName : permissions) {
            if (!permissionRepository.existsByPermissionName(permName)) {
                permissionRepository.save(new Permission(permName));
                logger.info("Created permission: {}", permName);
            }
        }
    }

    private void ensureAdminUser(UserRepository userRepository, RoleRepository roleRepository,
            PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        if (userRepository.findByUsername("adminUser").isEmpty()) {
            User admin = new User();
            admin.setUsername("adminUser");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setEmail("admin@numsbank.com");
            admin.setFirstName("System");
            admin.setLastName("Admin");

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByRoleName("ADMIN").orElseThrow());
            admin.setRoles(roles);

            Set<Permission> perms = new HashSet<>();
            permissionRepository.findByPermissionName("PERMISSION_ADMIN_LOGIN").ifPresent(perms::add);
            permissionRepository.findByPermissionName("PERMISSION_ADMIN_MANAGE_USERS").ifPresent(perms::add);
            permissionRepository.findByPermissionName("PERMISSION_ADMIN_ACCESS_AUDIT").ifPresent(perms::add);
            admin.setPermissions(perms);

            userRepository.save(admin);
            logger.info("Default admin user created");
        }
    }

    private void ensureStaffUser(UserRepository userRepository, RoleRepository roleRepository,
            PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        if (userRepository.findByUsername("staffUser").isEmpty()) {
            User user = new User();
            user.setUsername("staffUser");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setEmail("staff@numsbank.com");
            user.setFirstName("Bank");
            user.setLastName("Staff");

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByRoleName("BANK_STAFF").orElseThrow());
            user.setRoles(roles);

            userRepository.save(user);
            logger.info("Default staff user created");
        }
    }

    private void ensureAuditorUser(UserRepository userRepository, RoleRepository roleRepository,
            PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        if (userRepository.findByUsername("auditorUser").isEmpty()) {
            User user = new User();
            user.setUsername("auditorUser");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setEmail("auditor@numsbank.com");
            user.setFirstName("Compliance");
            user.setLastName("Auditor");

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByRoleName("AUDITOR").orElseThrow());
            user.setRoles(roles);

            userRepository.save(user);
            logger.info("Default auditor user created");
        }
    }

}

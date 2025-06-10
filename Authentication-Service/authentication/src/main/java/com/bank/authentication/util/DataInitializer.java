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
import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository, RoleRepository roleRepository, PermissionRepository permissionRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                // Create roles
                if (!roleRepository.existsByRoleName("ADMIN")) {
                    Role adminRole = new Role("ADMIN");
                    roleRepository.save(adminRole);
                }

                if (!roleRepository.existsByRoleName("USER")) {
                    Role userRole = new Role("USER");
                    roleRepository.save(userRole);
                }

                if (!roleRepository.existsByRoleName("CUSTOMER")) {
                    Role customerRole = new Role("CUSTOMER");
                    roleRepository.save(customerRole);
                }



                // Create permissions
                if (!permissionRepository.existsByPermissionName("PERMISSION_READ")) {
                    Permission readPermission = new Permission("PERMISSION_READ");
                    permissionRepository.save(readPermission);
                }

                if (!permissionRepository.existsByPermissionName("PERMISSION_WRITE")) {
                    Permission writePermission = new Permission("PERMISSION_WRITE");
                    permissionRepository.save(writePermission);
                }

                // Create the admin user with only ADMIN role
                Optional<User> existingAdminUser = userRepository.findByUsername("adminUser");
                if (existingAdminUser.isEmpty()) {
                    Set<Role> roles = new HashSet<>();
                    roles.add(roleRepository.findByRoleName("ADMIN").orElseThrow());

                    // Admin user typically gets all permissions, but you can adjust as needed
                    Set<Permission> permissions = new HashSet<>();
                    permissions.add(permissionRepository.findByPermissionName("PERMISSION_READ").orElseThrow());
                    permissions.add(permissionRepository.findByPermissionName("PERMISSION_WRITE").orElseThrow());

                    User user = new User();
                    user.setUsername("adminUser");
                    user.setPassword(passwordEncoder.encode("password1")); // Encode password here
                    user.setEmail("adminUser@bank.com");
                    user.setPhoneNumber("1234567890");
                    user.setFirstName("Admin");
                    user.setLastName("User");
                    user.setRoles(roles);
                    user.setPermissions(permissions);

                    userRepository.save(user);

                    logger.info("User 'adminUser' with ADMIN role created successfully");
                } else {
                    logger.info("User 'adminUser' already exists");
                }

                // Create the regular user with USER role only
                Optional<User> existingRegularUser = userRepository.findByUsername("regularUser");
                if (existingRegularUser.isEmpty()) {
                    Set<Role> roles = new HashSet<>();
                    roles.add(roleRepository.findByRoleName("USER").orElseThrow());

                    Set<Permission> permissions = new HashSet<>();
                    permissions.add(permissionRepository.findByPermissionName("PERMISSION_READ").orElseThrow());
                    permissions.add(permissionRepository.findByPermissionName("PERMISSION_WRITE").orElseThrow());

                    User user = new User();
                    user.setUsername("regularUser");
                    user.setPassword(passwordEncoder.encode("password2")); // Encode password here
                    user.setEmail("regularUser@bank.com");
                    user.setPhoneNumber("0987654321");
                    user.setFirstName("Regular");
                    user.setLastName("User");
                    user.setRoles(roles);
                    user.setPermissions(permissions);

                    userRepository.save(user);

                    logger.info("User 'regularUser' with USER role created successfully");
                } else {
                    logger.info("User 'regularUser' already exists");
                }

                logger.info("Server Started Successfully and Data Initialized");
            } catch (Exception e) {
                logger.error("Error during data initialization", e);
            }
        };
    }


}

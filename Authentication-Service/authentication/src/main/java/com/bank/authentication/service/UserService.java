package com.bank.authentication.service;


import com.bank.authentication.dto.*;
import com.bank.authentication.feignclient.AccountService;
import com.bank.authentication.feignclient.CustomerService;
import com.bank.authentication.model.Permission;
import com.bank.authentication.model.Role;
import com.bank.authentication.model.User;
import com.bank.authentication.repository.PermissionRepository;
import com.bank.authentication.repository.RoleRepository;
import com.bank.authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AccountService accountService;

    public void save(User user) {
        userRepository.save(user);
    }


    public UserDetailDto createUser(User user, Set<String> roleNames, Set<String> permissionNames) {
        // Validate user input
        validateUser(user);
        // Check if the username already exists
        if(!checkExistingUser(user)) throw new RuntimeException();
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Assign roles to user
        Set<Role> roles = getRoles(roleNames);
        user.setRoles(roles);
        // Assign permissions to user
        Set<Permission> permissions = getPermissions(permissionNames);
        user.setPermissions(permissions);
        // Save the user and return the DTO
        User savedUser = userRepository.save(user);
        return toUserDetailDto(savedUser);
    }

    private void validateUser(User user) {
        if (user.getUsername() == null || user.getPassword() == null) {
            throw new IllegalArgumentException("Username and password cannot be null");
        }
    }

    //checking the username existed or not
    private boolean checkExistingUser(User user) {
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser.isPresent()) {
            return false;
        } else {
            return true;
        }
    }

    public Set<Role> getRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByRoleName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            roles.add(role);
        }
        return roles;
    }

    private Set<Permission> getPermissions(Set<String> permissionNames) {
        Set<Permission> permissions = new HashSet<>();
        for (String permissionName : permissionNames) {
            Permission permission = permissionRepository.findByPermissionName(permissionName)
                    .orElseThrow(() -> new RuntimeException("Permission not found: " + permissionName));
            permissions.add(permission);
        }
        return permissions;
    }

    private UserDetailDto toUserDetailDto(User user) {
        UserDetailDto dto = new UserDetailDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());

        // Map roles
        Set<RoleDto> roleDtos = user.getRoles().stream()
                .map(role -> new RoleDto(role.getRoleId(), role.getRoleName()))
                .collect(Collectors.toSet());
        dto.setRoles(roleDtos);

        // Map permissions
        Set<PermissionDto> permissionDtos = user.getPermissions().stream()
                .map(permission -> new PermissionDto(permission.getPermissionId(), permission.getPermissionName()))
                .collect(Collectors.toSet());
        dto.setPermissions(permissionDtos);

        return dto;
    }


    public List<UserDetailDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserDetailDto dto = new UserDetailDto();
                    dto.setUserId(user.getUserId());
                    dto.setUsername(user.getUsername());
                    dto.setEmail(user.getEmail());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());

                    // Create RoleDto set
                    Set<RoleDto> roleDtos = user.getRoles().stream()
                            .map(role -> new RoleDto(role.getRoleId(), role.getRoleName()))
                            .collect(Collectors.toSet());
                    dto.setRoles(roleDtos);

                    // Create PermissionDto set
                    Set<PermissionDto> permissionDtos = user.getPermissions().stream()
                            .map(permission -> new PermissionDto(permission.getPermissionId(), permission.getPermissionName()))
                            .collect(Collectors.toSet());
                    dto.setPermissions(permissionDtos);

                    return dto;
                })
                .collect(Collectors.toList());
    }


    public void createCustomerUser(CreateCustomerDto createCustomerDto,String correlationId) {
        customerService.createCustomerUser(createCustomerDto,correlationId);
    }

    public void createAccountManagerUser(AccountManagerRequestDTO accountManagerRequestDTO) {
        accountService.createAccountUser(accountManagerRequestDTO);
    }
}

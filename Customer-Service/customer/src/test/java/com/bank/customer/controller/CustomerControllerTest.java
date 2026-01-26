package com.bank.customer.controller;

import com.bank.customer.api.CustomerController;
import com.bank.customer.dto.CreateCustomerDTO;
import com.bank.customer.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.sql.Date;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

	@Mock
	private CustomerService customerService;

	@InjectMocks
	private CustomerController customerController;

	@BeforeEach
	void setUp() {
		if (customerController == null) {
			customerController = new CustomerController();
		}
		ReflectionTestUtils.setField(customerController, "customerService", customerService);
	}

	@Test
	void testCreateCustomer_ShouldReturnCreated() throws Exception {
		CreateCustomerDTO input = new CreateCustomerDTO();
		input.setUserId(123L);
		input.setFirstName("John");
		input.setLastName("Doe");
		input.setEmail("john.doe@example.com");
		input.setPhoneNumber("+1234567890");
		input.setGender("MALE");
		input.setAddress("123 Main St");
		input.setDateOfBirth(Date.valueOf("1990-01-01"));
		input.setStatus("ACTIVE");

		CreateCustomerDTO created = new CreateCustomerDTO();
		created.setId(456L);
		created.setUserId(123L);
		created.setFirstName("John");
		created.setLastName("Doe");
		created.setEmail("john.doe@example.com");

		when(customerService.createCustomer(any(CreateCustomerDTO.class))).thenReturn(created);

		ResponseEntity<CreateCustomerDTO> response = customerController.createCustomer(input, "corr-1");
		assertNotNull(response);
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(456L, response.getBody().getId());

		verify(customerService).createCustomer(any(CreateCustomerDTO.class));
	}

	@Test
	void testGetCustomerByUserId_ShouldReturnOk() {
		CreateCustomerDTO dto = new CreateCustomerDTO();
		dto.setUserId(123L);
		dto.setEmail("john.doe@example.com");

		when(customerService.getCustomerByUserId(123L)).thenReturn(dto);

		ResponseEntity<CreateCustomerDTO> response = customerController.getCustomerByUserId(123L, "corr-1");
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(123L, response.getBody().getUserId());

		verify(customerService).getCustomerByUserId(123L);
	}

	@Test
	void testGetAllCustomers_ShouldReturnOk() {
		CreateCustomerDTO dto = new CreateCustomerDTO();
		dto.setUserId(123L);
		when(customerService.getAllCustomers()).thenReturn(Arrays.asList(dto));

		ResponseEntity<List<CreateCustomerDTO>> response = customerController.getAllCustomers("corr-1");
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(1, response.getBody().size());
		assertEquals(123L, response.getBody().get(0).getUserId());

		verify(customerService).getAllCustomers();
	}

	@Test
	void testDeleteCustomerById_ShouldReturnNoContent() {
		ResponseEntity<Void> response = customerController.deleteCustomerById(123L, "corr-1");
		assertNotNull(response);
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

		verify(customerService).deleteCustomerById(123L);
	}

	@Test
	void testUpdateCustomer_ShouldReturnOk() {
		CreateCustomerDTO update = new CreateCustomerDTO();
		update.setFirstName("John");
		update.setLastName("Updated");

		CreateCustomerDTO updated = new CreateCustomerDTO();
		updated.setUserId(123L);
		updated.setLastName("Updated");

		when(customerService.updateCustomer(eq(123L), any(CreateCustomerDTO.class))).thenReturn(updated);

		ResponseEntity<CreateCustomerDTO> response = customerController.updateCustomer(123L, update, "corr-1");
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals("Updated", response.getBody().getLastName());

		verify(customerService).updateCustomer(eq(123L), any(CreateCustomerDTO.class));
	}
}

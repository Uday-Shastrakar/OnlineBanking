import dayjs, { Dayjs } from "dayjs";

export interface ApiResponse<T>{
    data: T;
    status: String,
    message: string
}

export interface LoginResponse {
    success: boolean;
    data: {
        jwtToken: string;
        userName: string;
        authorities: string[];
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;  // Marking phoneNumber as optional since it may not be in every response
    };
    message: string;
}

export interface Credentials{
    username: String,
    password: String
}

export interface Role{
    roleId: number,
    roleName: String
}

export interface Permission{
    permissionId: number,
    permissionName: String
}

export interface User{
    userId: number,
    username: String,
    password: String,
    email: String,
    phoneNumber: String,
    firstName: String,
    lastName: String,
    roles: Role[],
    permissions: Permission[];
}

export interface RegisterForm {
    username: String;
    email: String;
    phoneNumber: String;
    firstName: String;
    lastName: String;
    password: String; 
    roleNames: String[],
    permissionNames:String[],
}

export interface CreateCustomerDto {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    gender: string;
    address: string;
    dateOfBirth: Dayjs;
    status: string;
    accountType: string;
  }

  export interface CustomerRegisterForm {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roleNames: string[];
    permissionNames: string[];
    createCustomerDto: CreateCustomerDto;
  }


  export interface GetCustomer {
    userId: number;
    email: String ;
    firstName: String ;
    lastName: String,
    phoneNumber: String,
    userName: String,
    gender: String,
    address: String,
    dateOfBirth: String,

  }
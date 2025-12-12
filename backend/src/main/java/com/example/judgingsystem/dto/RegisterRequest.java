package com.example.judgingsystem.dto;

import com.example.judgingsystem.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
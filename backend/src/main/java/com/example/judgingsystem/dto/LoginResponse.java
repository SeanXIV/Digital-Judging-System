package com.example.judgingsystem.dto;

import com.example.judgingsystem.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private Role role;
}
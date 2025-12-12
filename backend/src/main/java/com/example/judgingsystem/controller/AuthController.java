package com.example.judgingsystem.controller;

import com.example.judgingsystem.dto.LoginRequest;
import com.example.judgingsystem.dto.LoginResponse;
import com.example.judgingsystem.dto.RegisterRequest;
import com.example.judgingsystem.model.Role;
import com.example.judgingsystem.model.User;
import com.example.judgingsystem.repository.UserRepository;
import com.example.judgingsystem.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(loginRequest.getEmail());
        User user = userRepository.findByEmail(loginRequest.getEmail()).get();
        return ResponseEntity.ok(new LoginResponse(jwt, user.getId(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        userRepository.save(user);
        return ResponseEntity.ok("User registered");
    }

    @GetMapping("/judges")
    public List<Map<String, String>> getJudges() {
        return userRepository.findByRole(Role.JUDGE).stream()
            .filter(user -> user.getName() != null && user.getEmail() != null)
            .map(user -> Map.of("name", user.getName(), "email", user.getEmail()))
            .collect(Collectors.toList());
    }
}
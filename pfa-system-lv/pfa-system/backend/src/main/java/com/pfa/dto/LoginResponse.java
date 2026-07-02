package com.pfa.dto;

import com.pfa.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
}

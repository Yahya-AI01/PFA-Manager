package com.pfa.dto;

import com.pfa.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 6)
    private String motDePasse;

    @NotNull
    private Role role;
}

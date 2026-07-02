package com.pfa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimilariteDto {
    private Long sujetId;
    private String titre;
    private double similarite;
}

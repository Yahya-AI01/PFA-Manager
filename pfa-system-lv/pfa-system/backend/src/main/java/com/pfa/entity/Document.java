package com.pfa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nomOriginal;

    @Column(nullable = false, length = 500)
    private String cheminStockage;

    @Column(nullable = false, length = 100)
    private String typeMime;

    @Column(nullable = false)
    private Long tailleOctets;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private Utilisateur uploadePar;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    @PrePersist
    void prePersist() {
        if (dateUpload == null) dateUpload = LocalDateTime.now();
    }
}

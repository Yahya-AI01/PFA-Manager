package com.pfa.repository;

import com.pfa.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjetRepository extends JpaRepository<Projet, Long> {

    Optional<Projet> findBySujetId(Long sujetId);

    @Query("SELECT p FROM Projet p JOIN p.etudiants e WHERE e.id = :etudiantId")
    List<Projet> findByEtudiantId(@Param("etudiantId") Long etudiantId);

    @Query("SELECT p FROM Projet p WHERE p.sujet.professeur.id = :professeurId")
    List<Projet> findByProfesseurId(@Param("professeurId") Long professeurId);
}

package com.pfa.repository;

import com.pfa.entity.Sujet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SujetRepository extends JpaRepository<Sujet, Long> {

    List<Sujet> findByProfesseurId(Long professeurId);

    List<Sujet> findByDisponibleTrue();

    @Query("""
        SELECT s FROM Sujet s
        WHERE (:keyword IS NULL OR LOWER(s.titre) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:professeurId IS NULL OR s.professeur.id = :professeurId)
          AND (:annee IS NULL OR s.annee = :annee)
        """)
    List<Sujet> rechercher(@Param("keyword") String keyword,
                           @Param("professeurId") Long professeurId,
                           @Param("annee") Integer annee);
}

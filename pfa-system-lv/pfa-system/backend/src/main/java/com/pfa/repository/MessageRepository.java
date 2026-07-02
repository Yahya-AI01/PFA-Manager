package com.pfa.repository;

import com.pfa.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByProjetIdOrderByDateEnvoiAsc(Long projetId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.projet.id = :projetId AND m.expediteur.id <> :userId AND m.lu = false")
    long countNonLusPourUtilisateur(@Param("projetId") Long projetId, @Param("userId") Long userId);
}

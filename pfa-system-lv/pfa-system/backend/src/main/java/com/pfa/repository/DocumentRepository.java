package com.pfa.repository;

import com.pfa.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjetIdOrderByDateUploadDesc(Long projetId);
}

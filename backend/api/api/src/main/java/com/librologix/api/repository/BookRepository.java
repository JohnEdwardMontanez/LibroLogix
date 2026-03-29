package com.librologix.api.repository;

import com.librologix.api.model.book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<book, String> {
    // No SQL needed! Spring writes the queries automatically.
}
package com.librologix.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.librologix.api.model.book;
import com.librologix.api.repository.BookRepository;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:5173") // This allows your Vite React app to talk to Java without CORS errors!
public class BookController {

    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // GET endpoint to fetch all books
    @GetMapping
    public List<book> getAllBooks() {
        return bookRepository.findAll();
    }
}
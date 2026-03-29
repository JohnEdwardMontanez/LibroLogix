package com.librologix.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "books")
public class book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String author;
    private BigDecimal price;
    private LocalDate publishDate;
    private String status;
    private int stockRemaining;
    private int totalStock;
    private BigDecimal costPrice;

    // --- OOP STANDARD: GETTERS AND SETTERS ---
    // You MUST have these for Spring to read/write the data properly!
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public LocalDate getPublishDate() { return publishDate; }
    public void setPublishDate(LocalDate publishDate) { this.publishDate = publishDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getStockRemaining() { return stockRemaining; }
    public void setStockRemaining(int stockRemaining) { this.stockRemaining = stockRemaining; }

    public int getTotalStock() { return totalStock; }
    public void setTotalStock(int totalStock) { this.totalStock = totalStock; }

    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
}
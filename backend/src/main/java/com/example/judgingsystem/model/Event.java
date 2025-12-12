package com.example.judgingsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private LocalDate date;
    @ManyToOne
    private User organizer;
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Criterion> criteria;
    @JsonIgnore
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Team> teams;
    @JsonIgnore
    @OneToMany(mappedBy = "event")
    private List<User> judges;
}
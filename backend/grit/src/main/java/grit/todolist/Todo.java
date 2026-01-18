package grit.todolist;

import grit.user.User;
import grit.room.Room;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "todos")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "is_done", nullable = false)
    private Boolean isDone = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_category", nullable = false, length = 20)
    private SubjectCategory subjectCategory;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum SubjectCategory {
        SCHOOL("학교 과제"),
        PROJECT("프로젝트"),
        CERT("자격증"),
        ETC("기타");

        private final String label;

        SubjectCategory(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }
}


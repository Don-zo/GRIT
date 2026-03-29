package grit.domain.todo.entity;

import grit.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "todo_categories",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_todo_category_owner_name",
                columnNames = {"owner_id", "name"}))
public class TodoCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Member owner;

    @Column(nullable = false, length = 50)
    private String name;
}

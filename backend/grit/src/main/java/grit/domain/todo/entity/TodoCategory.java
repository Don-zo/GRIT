package grit.domain.todo.entity;

import grit.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "todo_categories", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"owner_id", "name"})
})
public class TodoCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Member owner;

    public TodoCategory(String name, Member owner) {
        this.name = name;
        this.owner = owner;
    }
}

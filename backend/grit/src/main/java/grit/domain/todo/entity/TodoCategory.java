package grit.domain.todo.entity;

import grit.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

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

    /** 소유자 기준 표시 순서 (0부터). 작을수록 앞에 표시. */
    @Column(name = "sort_order", nullable = false)
    @ColumnDefault("0")
    private int sortOrder;
}

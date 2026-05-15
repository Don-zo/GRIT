package grit.domain.todo.repository;
import grit.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT DISTINCT t FROM Todo t JOIN FETCH t.owner LEFT JOIN FETCH t.category WHERE t.owner.id = :ownerId")
    List<Todo> findByOwnerIdWithRelations(@Param("ownerId") Long ownerId);

    @Query(
            value = """
                    SELECT t FROM Todo t
                    JOIN FETCH t.owner
                    LEFT JOIN FETCH t.category c
                    WHERE t.owner.id = :ownerId
                      AND t.dueDate >= :from
                      AND t.dueDate <= :to
                    ORDER BY
                        t.isDone ASC,
                        CASE WHEN c.sortOrder IS NULL THEN 1 ELSE 0 END ASC,
                        c.sortOrder ASC,
                        t.content ASC,
                        t.id ASC
                    """
    )
    List<Todo> findByOwnerIdAndDueDateBetweenWithRelations(
            @Param("ownerId") Long ownerId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("SELECT DISTINCT t FROM Todo t JOIN FETCH t.owner LEFT JOIN FETCH t.category WHERE t.id = :id")
    Optional<Todo> findByIdWithRelations(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT t FROM Todo t JOIN FETCH t.owner o LEFT JOIN FETCH t.category
            WHERE EXISTS (
                SELECT 1 FROM MemberGroup mg
                WHERE mg.group.id = :groupId AND mg.member.id = o.id
            )
            """)
    List<Todo> findByGroupMembersTodosWithRelations(@Param("groupId") Long groupId);

    @Query("SELECT t FROM Todo t WHERE t.owner.id = :ownerId AND t.dueDate >= :from AND t.dueDate <= :to")
    List<Todo> findByOwnerIdAndDueDateBetween(@Param("ownerId") Long ownerId,
                                              @Param("from") LocalDate from,
                                              @Param("to") LocalDate to);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Todo t SET t.category = null WHERE t.category.id = :categoryId")
    void clearCategoryRefsByCategoryId(@Param("categoryId") Long categoryId);
}

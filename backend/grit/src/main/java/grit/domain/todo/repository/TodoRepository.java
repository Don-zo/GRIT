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

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.category JOIN FETCH t.owner WHERE t.owner.id = :ownerId")
    List<Todo> findByOwnerIdWithRelations(@Param("ownerId") Long ownerId);

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.category JOIN FETCH t.owner WHERE t.id = :id")
    Optional<Todo> findByIdWithRelations(@Param("id") Long id);

    /** 그룹 멤버가 작성한 투두 전부 (투두 엔티티에 그룹을 저장하지 않음) */
    @Query("""
            SELECT t FROM Todo t LEFT JOIN FETCH t.category
            JOIN FETCH t.owner o
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

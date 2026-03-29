package grit.domain.todo.repository;

import grit.domain.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT t FROM Todo t JOIN FETCH t.group g JOIN FETCH t.owner LEFT JOIN FETCH t.category WHERE g.id = :groupId")
    List<Todo> findByGroupIdWithRelations(@Param("groupId") Long groupId);

    @Query("SELECT t FROM Todo t JOIN FETCH t.group g JOIN FETCH t.owner LEFT JOIN FETCH t.category WHERE g.id = :groupId AND t.owner.id = :ownerId")
    List<Todo> findByGroupIdAndOwnerIdWithRelations(@Param("groupId") Long groupId, @Param("ownerId") Long ownerId);

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.group g JOIN FETCH t.owner LEFT JOIN FETCH t.category WHERE t.owner.id = :ownerId")
    List<Todo> findByOwnerIdWithRelations(@Param("ownerId") Long ownerId);

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.group g JOIN FETCH t.owner LEFT JOIN FETCH t.category WHERE t.id = :id")
    Optional<Todo> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT t FROM Todo t WHERE t.owner.id = :ownerId AND t.dueDate BETWEEN :from AND :to")
    List<Todo> findByOwnerIdAndDueDateBetween(@Param("ownerId") Long ownerId,
                                              @Param("from") LocalDate from,
                                              @Param("to") LocalDate to);
}

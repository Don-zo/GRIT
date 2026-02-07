package grit.todolist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    @Query("SELECT t FROM Todo t JOIN FETCH t.room JOIN FETCH t.owner WHERE t.room.id = :roomId")
    List<Todo> findByRoomIdWithRelations(@Param("roomId") Long roomId);

    @Query("SELECT t FROM Todo t JOIN FETCH t.room JOIN FETCH t.owner WHERE t.room.id = :roomId AND t.owner.id = :ownerId")
    List<Todo> findByRoomIdAndOwnerIdWithRelations(@Param("roomId") Long roomId, @Param("ownerId") Long ownerId);

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.room JOIN FETCH t.owner WHERE t.owner.id = :ownerId")
    List<Todo> findByOwnerIdWithRelations(@Param("ownerId") Long ownerId);

    @Query("SELECT t FROM Todo t LEFT JOIN FETCH t.room JOIN FETCH t.owner WHERE t.id = :id")
    Optional<Todo> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT t FROM Todo t WHERE t.owner.id = :ownerId AND t.dueDate IS NOT NULL AND t.dueDate >= :from AND t.dueDate <= :to")
    List<Todo> findByOwnerIdAndDueDateBetween(@Param("ownerId") Long ownerId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}


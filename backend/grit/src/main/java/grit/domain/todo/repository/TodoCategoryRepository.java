package grit.domain.todo.repository;

import grit.domain.todo.entity.TodoCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoCategoryRepository extends JpaRepository<TodoCategory, Long> {

    List<TodoCategory> findByOwner_IdOrderByNameAsc(Long ownerId);

    Optional<TodoCategory> findByIdAndOwner_Id(Long id, Long ownerId);

    boolean existsByOwner_IdAndName(Long ownerId, String name);
}

package grit.domain.todo.repository;

import grit.domain.todo.entity.TodoCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoCategoryRepository extends JpaRepository<TodoCategory, Long> {

    List<TodoCategory> findByOwnerIdOrderByNameAsc(Long ownerId);

    Optional<TodoCategory> findByOwnerIdAndName(Long ownerId, String name);

    boolean existsByOwnerIdAndName(Long ownerId, String name);
}

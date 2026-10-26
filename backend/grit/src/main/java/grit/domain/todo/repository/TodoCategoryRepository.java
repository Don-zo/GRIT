package grit.domain.todo.repository;

import grit.domain.todo.entity.TodoCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TodoCategoryRepository extends JpaRepository<TodoCategory, Long> {

    List<TodoCategory> findByOwner_IdOrderBySortOrderAscIdAsc(Long ownerId);

    @Query("select coalesce(max(c.sortOrder), -1) from TodoCategory c where c.owner.id = :ownerId")
    int findMaxSortOrderByOwnerId(@Param("ownerId") Long ownerId);

    Optional<TodoCategory> findByIdAndOwner_Id(Long id, Long ownerId);

    boolean existsByOwner_IdAndName(Long ownerId, String name);

    @Modifying
    @Query("delete from TodoCategory e where e.owner.id = :memberId")
    void deleteAllForMember(@Param("memberId") Long memberId);
}

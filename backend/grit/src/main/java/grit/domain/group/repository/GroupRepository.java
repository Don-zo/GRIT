package grit.domain.group.repository;

import grit.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long>  {
    boolean existsByCode(String code);
    Optional<Group> findByCode(String code);
}

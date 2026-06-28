package grit.domain.group.repository;

import grit.domain.group.entity.Group;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface GroupRepository extends JpaRepository<Group, Long> {

    boolean existsByCode(String code);

    Optional<Group> findByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Group> findLockedByCode(String code);
}

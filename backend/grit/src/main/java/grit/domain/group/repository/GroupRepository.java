package grit.domain.group.repository;

import grit.domain.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long>  {
    boolean existsByInviteCode(String inviteCode); // 초대 코드 중복 체크
    Optional<Group> findByInviteCode(String inviteCode);
}

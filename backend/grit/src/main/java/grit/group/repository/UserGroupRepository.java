package grit.group.repository;

import grit.group.entity.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    // 특정 유저가 특정 그룹에 속해있는 엔티티 찾기
    Optional<UserGroup> findByUserIdAndGroupId(Long userId, Long groupId);

    // 사용자가 속해있는 모든 그룹 찾기
    List<UserGroup> findAllByUserId(Long userId);

    // 사용자가 그룹 멤버인지 확인
    boolean existsByUserIdAndGroupId(Long userId, Long groupId);
}

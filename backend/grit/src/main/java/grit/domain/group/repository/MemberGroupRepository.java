package grit.domain.group.repository;

import grit.domain.group.entity.MemberGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberGroupRepository extends JpaRepository<MemberGroup, Long> {
    // 특정 유저가 특정 그룹에 속해있는 엔티티 찾기
    Optional<MemberGroup> findByMemberIdAndGroupId(Long memberId, Long groupId);

    // 사용자가 속해있는 모든 그룹 찾기
    List<MemberGroup> findAllByMemberId(Long memberId);

    // 사용자가 그룹 멤버인지 확인
    boolean existsByMemberIdAndGroupId(Long memberId, Long groupId);
}

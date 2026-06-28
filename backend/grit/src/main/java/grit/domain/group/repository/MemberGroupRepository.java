package grit.domain.group.repository;

import grit.domain.group.entity.Group;
import grit.domain.group.entity.MemberGroup;
import grit.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberGroupRepository extends JpaRepository<MemberGroup, Long> {
    Optional<MemberGroup> findByMemberAndGroup(Member member, Group group);

    List<MemberGroup> findAllByMember(Member member);

    boolean existsByMemberAndGroup(Member member, Group group);

    boolean existsByMember_IdAndGroup_Id(Long memberId, Long groupId);

    @Query("""
            SELECT mg FROM MemberGroup mg
            JOIN FETCH mg.member m
            WHERE mg.group.id = :groupId
            """)
    List<MemberGroup> findAllByGroupIdWithMember(@Param("groupId") Long groupId);
}

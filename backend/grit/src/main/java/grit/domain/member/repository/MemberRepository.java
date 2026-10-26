package grit.domain.member.repository;

import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 회원 찾기 기능
    Optional<Member> findByEmail(String email);
    Optional<Member> findByNickname(String nickname);
    Optional<Member> findByProviderAndProviderId(SocialProvider provider, String providerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Member> findLockedById(Long id);

    @Modifying
    @Query(value =
            "delete from friendship where member_id = :memberId or friend_id = :memberId", nativeQuery = true)
    void deleteFriendships(@Param("memberId") Long memberId);

    // 존재 여부 확인
    boolean existsByNickname(String nickname);
    boolean existsByEmail(String email);
    boolean existsByImageName(UUID imageName);
}

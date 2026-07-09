package grit.domain.member.repository;

import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 회원 찾기 기능
    Optional<Member> findByEmail(String email);
    Optional<Member> findByNickname(String nickname);
    Optional<Member> findByProviderAndProviderId(SocialProvider provider, String providerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Member> findLockedById(Long id);

    // 존재 여부 확인
    boolean existsByNickname(String nickname);
    boolean existsByEmail(String email);
}

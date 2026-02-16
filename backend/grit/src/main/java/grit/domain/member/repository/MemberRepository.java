package grit.domain.member.repository;

import grit.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 회원 찾기 기능
    Optional<Member> findByEmail(String email);
    Optional<Member> findByNickname(String nickname);

    // 존재 여부 확인
    boolean existsByNickname(String nickname);
    boolean existsByEmail(String email);
}

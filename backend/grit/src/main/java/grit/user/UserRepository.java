package grit.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 회원 찾기 기능
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);

    // 존재 여부 확인
    boolean existsByNickname(String nickname);
    boolean existsByEmail(String email);
}

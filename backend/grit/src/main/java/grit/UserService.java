package grit;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;

    // 회원 가입
    public Long join(User user) {
        validNickname(user);
        return userRepository.save(user).getId();
    }

    // 닉네임 중복 체크
    private void validNickname(User user) {
        userRepository.findByNickname(user.getNickname())
                .ifPresent(message -> { throw new IllegalStateException("이미 사용 중인 닉네임입니다."); });
    }

    // 이메일 중복 체크
    private void validEmail(User user) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(message -> { throw new IllegalStateException("이미 존재하는 회원입니다."); });
    }

    // 회원 전체 조회
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // 단일 회원 조회
    public User findOne(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(id + " 회원을 찾을 수 없습니다."));
    }

    // 정보 수정
    public void update(Long id, User updateParam) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 회원입니다."));
        user.setNickname(updateParam.getNickname());
        user.setPassword(updateParam.getPassword());
    }

    // 회원 탈퇴
    public void delete(Long id) {
        if (!userRepository.findById(id).isPresent()) {
            throw new NoSuchElementException("존재하지 않는 회원입니다.");
        }
        userRepository.deleteById(id);
    }
}

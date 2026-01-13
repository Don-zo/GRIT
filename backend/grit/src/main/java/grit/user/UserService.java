package grit.user;

import grit.user.dto.CreateUserRequestDTO;
import grit.user.dto.UpdateUserRequestDTO;
import grit.user.dto.UserResponseDTO;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원 가입
    public User join(CreateUserRequestDTO request) {
        validNickname(request.getNickname());
        validEmail(request.getEmail());

        String encodedPW = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .password(encodedPW)
                .build();

        return userRepository.save(user);
    }

    // 닉네임 중복 체크
    private void validNickname(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalStateException("이미 존재하는 닉네임입니다.");
        }
    }

    // 이메일 중복 체크
    private void validEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("이미 존재하는 이메일입니다.");
        }
    }

    // 회원 전체 조회
    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::new)
                .toList();
    }

    // 단일 회원 조회
    public UserResponseDTO findOne(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(id + " 회원을 찾을 수 없습니다."));
        return new UserResponseDTO(user);
    }

    // 정보 수정
    @Transactional
    public void update(Long id, UpdateUserRequestDTO updateParam) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 회원입니다."));

        // nickname 수정
        String newNickname = updateParam.getNickname();
        if (newNickname != null && !user.getNickname().equals(newNickname)) {
            if (userRepository.existsByNickname(newNickname)) {
                throw new IllegalStateException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(newNickname);
        }

        // password 수정
        String newRawPassword = updateParam.getPassword();
        if (newRawPassword != null && !passwordEncoder.matches(newRawPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newRawPassword));
        }

        // introduction 수정
        String newIntroduction = updateParam.getIntroduction();
        if (newIntroduction != null) {
            user.setIntroduction(newIntroduction);
        }
    }

    // 회원 탈퇴
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 회원입니다."));
        userRepository.delete(user);
    }
}

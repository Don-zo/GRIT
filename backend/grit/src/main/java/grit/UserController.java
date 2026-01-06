package grit;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final UserService userService;

    // 회원 가입
    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // 전체 회원 조회
    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 특정 회원 조회
    @GetMapping("/{id}")
    public ResponseEntity<User> findOne(@PathVariable Long id) {
        User user = userService.findOne(id);
        return ResponseEntity.ok(user);
    }

    // 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<Long> update(@PathVariable Long id, @RequestBody User updateParam) {
        userService.update(id, updateParam);
        return ResponseEntity.ok(id);
    }

    // 회원 탈퇴
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
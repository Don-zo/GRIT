package grit.user;

import grit.user.dto.CreateUserRequestDTO;
import grit.user.dto.UpdateUserRequestDTO;
import grit.user.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // 회원 가입
    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody CreateUserRequestDTO request) {
        User user = userService.join(request);
        return ResponseEntity.ok(new UserResponseDTO(user));
    }

    // 전체 회원 조회
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    // 특정 회원 조회
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findOne(@PathVariable Long id) {
        UserResponseDTO response = userService.findOne(id);
        return ResponseEntity.ok(response);
    }

    // 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id, @RequestBody UpdateUserRequestDTO updateParam) {
        userService.update(id, updateParam);

        UserResponseDTO updateUser = userService.findOne(id);
        return ResponseEntity.ok(updateUser);
    }

    // 회원 탈퇴
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
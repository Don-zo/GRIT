package grit.user;

import grit.user.dto.CreateUserRequestDTO;
import grit.user.dto.UpdateUserRequestDTO;
import grit.user.dto.UserResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "User", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(summary = "회원 가입", description = "신규 사용자를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "409", description = "이미 존재하는 이메일 또는 닉네임", content = @Content),
            @ApiResponse(responseCode = "400", description = "입력값 누락 또는 형식이 올바르지 않음", content = @Content)
    })
    @PostMapping
    public ResponseEntity<UserResponseDTO> create(@RequestBody CreateUserRequestDTO request) {
        User user = userService.join(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponseDTO(user));
    }

    @Operation(summary = "전체 회원 조회", description = "전체 사용자를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @Operation(summary = "특정 회원 조회", description = "id를 이용하여 특정 사용자를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findOne(@Parameter(description = "사용자 고유 ID (PK)", example = "1") @PathVariable Long id) {
        UserResponseDTO response = userService.findOne(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "정보 수정", description = "사용자의 정보(닉네임, 비밀번호, 한 줄 소개)를 수정합니다. 3개 중 하나만 응답 바디에 적어도 정상적으로 수정됩니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "정보 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 기존 비밀번호/닉네임과 동일한 값으로 변경 시도)", content = @Content),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자 ID", content = @Content),
            @ApiResponse(responseCode = "409", description = "이미 사용 중인 닉네임", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@Parameter(description = "사용자 고유 ID (PK)", example = "1") @PathVariable Long id, @RequestBody UpdateUserRequestDTO updateParam) {
        userService.update(id, updateParam);

        UserResponseDTO updateUser = userService.findOne(id);
        return ResponseEntity.ok(updateUser);
    }

    @Operation(summary = "회원 탈퇴", description = "사용자를 삭제(탈퇴)합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공 (반환값 없음)"),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "사용자 고유 ID (PK)", example = "1") @PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
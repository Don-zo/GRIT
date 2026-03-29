package grit.domain.todo.service;

import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.CreateTodoCategoryRequestDto;
import grit.domain.todo.dto.TodoCategoryResponseDto;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.repository.TodoCategoryRepository;
import grit.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoCategoryService {
    private final TodoCategoryRepository todoCategoryRepository;
    private final TodoRepository todoRepository;
    private final MemberRepository memberRepository;

    public List<TodoCategoryResponseDto> findByUserId(Long userId) {
        if (!memberRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }
        return todoCategoryRepository.findByOwner_IdOrderByNameAsc(userId).stream()
                .map(TodoCategoryResponseDto::from)
                .toList();
    }

    @Transactional
    public TodoCategoryResponseDto create(Long userId, CreateTodoCategoryRequestDto request) {
        Member owner = memberRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        String name = request.getName().trim();
        if (name.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리 이름을 입력해주세요.");
        }
        if (todoCategoryRepository.existsByOwner_IdAndName(userId, name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 같은 이름의 카테고리가 있습니다.");
        }

        TodoCategory category = new TodoCategory();
        category.setOwner(owner);
        category.setName(name);
        return TodoCategoryResponseDto.from(todoCategoryRepository.save(category));
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        TodoCategory category = todoCategoryRepository.findByIdAndOwner_Id(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));

        todoRepository.clearCategoryRefsByCategoryId(category.getId());
        todoCategoryRepository.delete(category);
    }
}

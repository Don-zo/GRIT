package grit.domain.todo.service;

import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.TodoCategoryRequestDTO;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.repository.TodoCategoryRepository;
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
    private final MemberRepository memberRepository;

    public List<TodoCategory> findAllByOwnerId(Long userId) {
        return todoCategoryRepository.findByOwnerIdOrderByNameAsc(userId);
    }

    @Transactional
    public TodoCategory create(Long userId, TodoCategoryRequestDTO request) {
        Member owner = memberRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        String name = request.getName();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리 이름을 입력해주세요.");
        }

        String trimmedName = name.trim();
        if (todoCategoryRepository.existsByOwnerIdAndName(userId, trimmedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 카테고리 이름입니다.");
        }

        TodoCategory category = new TodoCategory(trimmedName, owner);
        return todoCategoryRepository.save(category);
    }

    @Transactional
    public void delete(Long categoryId, Long userId) {
        TodoCategory category = todoCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));

        if (!category.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 카테고리만 삭제할 수 있습니다.");
        }

        todoCategoryRepository.delete(category);
    }
}

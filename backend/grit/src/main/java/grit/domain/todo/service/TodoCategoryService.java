package grit.domain.todo.service;

import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.CreateTodoCategoryRequestDto;
import grit.domain.todo.dto.ReorderTodoCategoriesRequestDto;
import grit.domain.todo.dto.TodoCategoryResponseDto;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.repository.TodoCategoryRepository;
import grit.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        return todoCategoryRepository.findByOwner_IdOrderBySortOrderAscIdAsc(userId).stream()
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
        int nextOrder = todoCategoryRepository.findMaxSortOrderByOwnerId(userId) + 1;
        category.setSortOrder(nextOrder);
        return TodoCategoryResponseDto.from(todoCategoryRepository.save(category));
    }

    @Transactional
    public List<TodoCategoryResponseDto> reorder(Long userId, ReorderTodoCategoriesRequestDto request) {
        if (!memberRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
        }

        List<Long> orderedIds = request.getCategoryIds();
        if (new HashSet<>(orderedIds).size() != orderedIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리 ID가 중복되었습니다.");
        }

        List<TodoCategory> owned = todoCategoryRepository.findByOwner_IdOrderBySortOrderAscIdAsc(userId);
        Set<Long> expectedIds = owned.stream().map(TodoCategory::getId).collect(Collectors.toSet());
        if (expectedIds.size() != orderedIds.size() || !expectedIds.equals(new HashSet<>(orderedIds))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "등록된 카테고리와 동일한 ID 목록을 보내주세요.");
        }

        Map<Long, TodoCategory> byId = owned.stream()
                .collect(Collectors.toMap(TodoCategory::getId, Function.identity()));
        for (int i = 0; i < orderedIds.size(); i++) {
            TodoCategory cat = Objects.requireNonNull(byId.get(orderedIds.get(i)));
            cat.setSortOrder(i);
        }

        return orderedIds.stream()
                .map(id -> TodoCategoryResponseDto.from(byId.get(id)))
                .toList();
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        TodoCategory category = todoCategoryRepository.findByIdAndOwner_Id(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));

        todoRepository.clearCategoryRefsByCategoryId(category.getId());
        todoCategoryRepository.delete(category);
    }
}

package grit.domain.todo.service;

import grit.domain.group.entity.Group;
import grit.domain.group.repository.GroupRepository;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.DailyAchievementDTO;
import grit.domain.todo.dto.MoveTodoDueDateRequestDTO;
import grit.domain.todo.dto.SetTodoDoneRequestDTO;
import grit.domain.todo.dto.TodoResponseDTO;
import grit.domain.todo.dto.UpdateTodoRequestDTO;
import grit.domain.todo.dto.WeeklyTodosPageResponseDTO;
import grit.domain.todo.entity.Todo;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.repository.TodoCategoryRepository;
import grit.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Collator;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {
    /** {@link Collator}는 스레드 세이프가 아니므로 스레드 로컬로 둡니다. */
    private static final ThreadLocal<Collator> KOREAN_TEXT_ORDER =
            ThreadLocal.withInitial(() -> Collator.getInstance(Locale.KOREA));

    private final TodoRepository todoRepository;
    private final TodoCategoryRepository todoCategoryRepository;
    private final MemberRepository memberRepository;
    private final GroupRepository groupRepository;
    private final MemberGroupRepository memberGroupRepository;

    public WeeklyTodosPageResponseDTO findByUserIdWeekly(Long userId, LocalDate weekStartDate, int page, int size) {
        LocalDate normalizedWeekStart = weekStartDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEndDate = normalizedWeekStart.plusDays(6);

        Page<Todo> todosPage = todoRepository.findByOwnerIdAndDueDateBetweenWithRelations(
                userId,
                normalizedWeekStart,
                weekEndDate,
                PageRequest.of(page, size)
        );

        return new WeeklyTodosPageResponseDTO(
                normalizedWeekStart,
                weekEndDate,
                todosPage.getNumber(),
                todosPage.getSize(),
                todosPage.getTotalElements(),
                todosPage.getTotalPages(),
                todosPage.hasNext(),
                todosPage.getContent().stream()
                        .map(TodoResponseDTO::from)
                        .toList()
        );
    }

    public List<Todo> findForGroup(String groupCode, Long requesterUserId, Long focusUserId) {
        Member requester = memberRepository.findById(requesterUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Group group = groupRepository.findByCode(groupCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유효하지 않은 그룹 코드입니다."));

        if (!memberGroupRepository.existsByMemberAndGroup(requester, group)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 그룹의 멤버가 아닙니다.");
        }

        if (!memberGroupRepository.existsByMember_IdAndGroup_Id(focusUserId, group.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 그룹에 속하지 않은 사용자입니다.");
        }

        return todoRepository.findByGroupMembersTodosWithRelations(group.getId()).stream()
                .sorted(Comparator.comparing((Todo t) -> !t.getOwner().getId().equals(focusUserId))
                        .thenComparing(todoDisplayComparator()))
                .toList();
    }

    private Comparator<Todo> todoDisplayComparator() {
        return Comparator.comparing(Todo::isDone)
                .thenComparing(
                        t -> t.getCategory() == null ? null : t.getCategory().getSortOrder(),
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Todo::getContent, KOREAN_TEXT_ORDER.get())
                .thenComparing(Todo::getId);
    }

    @Transactional
    public Todo create(Long userId, CreateTodoRequestDTO request) {
        Member owner = memberRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        Todo todo = new Todo();
        todo.setOwner(owner);
        todo.setContent(request.getContent().trim());
        todo.setDueDate(request.getDueDate());
        todo.setIsDone(false);

        if (request.getCategoryId() != null) {
            TodoCategory category = todoCategoryRepository.findByIdAndOwner_Id(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
            todo.setCategory(category);
        }

        return todoRepository.save(todo);
    }

    @Transactional
    public Todo update(Long todoId, Long userId, UpdateTodoRequestDTO request) {
        Todo todo = getTodoAndValidateOwner(todoId, userId);

        if (request.getContent() != null) {
            String trimmed = request.getContent().trim();
            if (trimmed.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "투두 내용을 입력해주세요.");
            }
            todo.setContent(trimmed);
        }
        if (request.getIsDone() != null) {
            todo.setIsDone(request.getIsDone());
        }
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        }

        if (Boolean.TRUE.equals(request.getRemoveCategory())) {
            todo.setCategory(null);
        } else if (request.getCategoryId() != null) {
            TodoCategory category = todoCategoryRepository.findByIdAndOwner_Id(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."));
            todo.setCategory(category);
        }

        return todo;
    }

    @Transactional
    public Todo moveDueDate(Long todoId, Long userId, MoveTodoDueDateRequestDTO request) {
        Todo todo = getTodoAndValidateOwner(todoId, userId);
        todo.setDueDate(request.getDueDate());
        return todo;
    }

    @Transactional
    public Todo setDone(Long todoId, Long userId, SetTodoDoneRequestDTO request) {
        Todo todo = getTodoAndValidateOwner(todoId, userId);
        todo.setIsDone(request.getIsDone());
        return todo;
    }

    @Transactional
    public void delete(Long todoId, Long userId) {
        getTodoAndValidateOwner(todoId, userId, "본인의 투두만 삭제할 수 있습니다.");
        todoRepository.deleteById(todoId);
    }

    private Todo getTodoAndValidateOwner(Long todoId, Long userId) {
        return getTodoAndValidateOwner(todoId, userId, "본인의 투두만 수정할 수 있습니다.");
    }

    private Todo getTodoAndValidateOwner(Long todoId, Long userId, String forbiddenMessage) {
        Todo todo = todoRepository.findByIdWithRelations(todoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "투두를 찾을 수 없습니다."));

        if (!todo.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, forbiddenMessage);
        }
        return todo;
    }

    public List<DailyAchievementDTO> getLast7DaysAchievement(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(7);
        LocalDate to = today.minusDays(1);

        List<Todo> todos = todoRepository.findByOwnerIdAndDueDateBetween(userId, from, to);

        Map<LocalDate, List<Todo>> todosByDate = todos.stream()
                .collect(Collectors.groupingBy(Todo::getDueDate));

        List<DailyAchievementDTO> result = new ArrayList<>();

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            List<Todo> todosOfDay = todosByDate.getOrDefault(date, Collections.emptyList());

            long total = todosOfDay.size();
            long done = todosOfDay.stream()
                    .filter(Todo::isDone)
                    .count();

            if (total == 0) {
                result.add(new DailyAchievementDTO(date, null, null, null));
            } else {
                result.add(new DailyAchievementDTO(date, total, done));
            }
        }

        return result;
    }
}

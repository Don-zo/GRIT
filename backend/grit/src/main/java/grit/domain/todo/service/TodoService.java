package grit.domain.todo.service;
import grit.domain.group.GroupService;
import grit.domain.group.entity.Group;
import grit.domain.group.repository.MemberGroupRepository;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.todo.dto.CreateTodoRequestDTO;
import grit.domain.todo.dto.AchievementOverviewResponseDTO;
import grit.domain.todo.dto.DailyAchievementDTO;
import grit.domain.todo.dto.GroupMemberTodosResponseDto;
import grit.domain.todo.dto.MoveTodoDueDateRequestDTO;
import grit.domain.todo.dto.SetTodoDoneRequestDTO;
import grit.domain.todo.dto.TodoResponseDTO;
import grit.domain.todo.dto.UpdateTodoRequestDTO;
import grit.domain.todo.dto.TodoRangeResponseDTO;
import grit.domain.todo.entity.Todo;
import grit.domain.todo.entity.TodoCategory;
import grit.domain.todo.repository.TodoCategoryRepository;
import grit.domain.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.text.Collator;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {
    private static final ThreadLocal<Collator> KOREAN_TEXT_ORDER =
            ThreadLocal.withInitial(() -> Collator.getInstance(Locale.KOREA));

    private final TodoRepository todoRepository;
    private final TodoCategoryRepository todoCategoryRepository;
    private final MemberRepository memberRepository;
    private final GroupService groupService;
    private final MemberGroupRepository memberGroupRepository;
    private final Clock clock;

    public TodoRangeResponseDTO findByUserIdInRange(Long userId, LocalDate startDate, int dayCount) {
        LocalDate endDate = startDate.plusDays(dayCount - 1L);

        List<TodoResponseDTO> todos = todoRepository
                .findByOwnerIdAndDueDateBetweenWithRelations(userId, startDate, endDate)
                .stream()
                .map(TodoResponseDTO::from)
                .toList();

        return new TodoRangeResponseDTO(
                startDate,
                endDate,
                dayCount,
                todos.size(),
                todos
        );
    }

    public GroupMemberTodosResponseDto findGroupMemberTodos(String groupCode, Long requesterUserId, Long memberId, String view) {
        Group group = groupService.validateGroupMembership(groupCode, requesterUserId);

        if (!memberGroupRepository.existsByMember_IdAndGroup_Id(memberId, group.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 그룹에 속하지 않은 사용자입니다.");
        }

        LocalDate startDate = LocalDate.now(clock);
        LocalDate endDate = startDate.plusDays(2);
        List<Todo> todos = todoRepository.findByOwnerIdAndDueDateBetweenWithRelationsUnsorted(memberId, startDate, endDate);

        String normalizedView = view == null ? "day" : view.toLowerCase(Locale.ROOT);
        List<GroupMemberTodosResponseDto.SectionDto> sections = switch (normalizedView) {
            case "category" -> buildCategorySections(todos, memberId);
            case "day" -> buildDaySections(todos, startDate);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "view는 category 또는 day만 가능합니다.");
        };

        return new GroupMemberTodosResponseDto(normalizedView, startDate, endDate, sections);
    }

    private List<GroupMemberTodosResponseDto.SectionDto> buildCategorySections(List<Todo> todos, Long memberId) {
        List<TodoCategory> categories = todoCategoryRepository.findByOwner_IdOrderBySortOrderAscIdAsc(memberId);
        Map<Long, GroupMemberTodosResponseDto.SectionDto> sectionMap = new LinkedHashMap<>();
        for (TodoCategory category : categories) {
            sectionMap.put(
                    category.getId(),
                    new GroupMemberTodosResponseDto.SectionDto(
                            "category:" + category.getId(),
                            category.getName(),
                            new ArrayList<>()
                    )
            );
        }
        GroupMemberTodosResponseDto.SectionDto uncategorized =
                new GroupMemberTodosResponseDto.SectionDto("uncategorized", "미분류", new ArrayList<>());

        List<TodoResponseDTO> sortedTodos = todos.stream()
                .sorted(categoryViewComparator())
                .map(TodoResponseDTO::from)
                .toList();

        for (TodoResponseDTO todo : sortedTodos) {
            if (todo.getCategoryId() == null) {
                uncategorized.todos().add(todo);
                continue;
            }
            GroupMemberTodosResponseDto.SectionDto section = sectionMap.get(todo.getCategoryId());
            if (section == null) {
                uncategorized.todos().add(todo);
            } else {
                section.todos().add(todo);
            }
        }

        List<GroupMemberTodosResponseDto.SectionDto> sections = sectionMap.values().stream()
                .filter(section -> !section.todos().isEmpty())
                .collect(Collectors.toCollection(ArrayList::new));
        if (!uncategorized.todos().isEmpty()) {
            sections.add(uncategorized);
        }
        return sections;
    }

    private List<GroupMemberTodosResponseDto.SectionDto> buildDaySections(List<Todo> todos, LocalDate startDate) {
        Map<LocalDate, GroupMemberTodosResponseDto.SectionDto> sectionsByDate = new LinkedHashMap<>();
        sectionsByDate.put(startDate, new GroupMemberTodosResponseDto.SectionDto("today", "오늘", new ArrayList<>()));
        sectionsByDate.put(startDate.plusDays(1), new GroupMemberTodosResponseDto.SectionDto("tomorrow", "내일", new ArrayList<>()));
        sectionsByDate.put(startDate.plusDays(2), new GroupMemberTodosResponseDto.SectionDto("dayAfterTomorrow", "2일 후", new ArrayList<>()));

        List<TodoResponseDTO> sortedTodos = todos.stream()
                .sorted(dayViewComparator())
                .map(TodoResponseDTO::from)
                .toList();

        for (TodoResponseDTO todo : sortedTodos) {
            GroupMemberTodosResponseDto.SectionDto section = sectionsByDate.get(todo.getDueDate());
            if (section != null) {
                section.todos().add(todo);
            }
        }
        return new ArrayList<>(sectionsByDate.values());
    }

    private Comparator<Todo> categoryViewComparator() {
        return Comparator.comparing(Todo::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Todo::getContent, KOREAN_TEXT_ORDER.get())
                .thenComparing(Todo::getId);
    }

    private Comparator<Todo> dayViewComparator() {
        return Comparator.comparing(
                        (Todo t) -> t.getCategory() == null ? null : t.getCategory().getSortOrder(),
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

    public AchievementOverviewResponseDTO getLast7DaysAchievement(Long userId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate last7DaysFrom = today.minusDays(7);
        LocalDate last7DaysTo = today.minusDays(1);

        List<Todo> todos = todoRepository.findByOwnerIdAndDueDateBetween(userId, last7DaysFrom, today);

        Map<LocalDate, List<Todo>> todosByDate = todos.stream()
                .collect(Collectors.groupingBy(Todo::getDueDate));

        List<DailyAchievementDTO> last7Days = new ArrayList<>();

        for (LocalDate date = last7DaysFrom; !date.isAfter(last7DaysTo); date = date.plusDays(1)) {
            List<Todo> todosOfDay = todosByDate.getOrDefault(date, Collections.emptyList());

            long total = todosOfDay.size();
            long done = todosOfDay.stream()
                    .filter(Todo::isDone)
                    .count();

            if (total == 0) {
                last7Days.add(new DailyAchievementDTO(date, null, null, null));
            } else {
                last7Days.add(new DailyAchievementDTO(date, total, done));
            }
        }

        List<Todo> todayTodos = todosByDate.getOrDefault(today, Collections.emptyList());
        long todayTotal = todayTodos.size();
        long todayDone = todayTodos.stream()
                .filter(Todo::isDone)
                .count();

        DailyAchievementDTO todayAchievement = (todayTotal == 0)
                ? new DailyAchievementDTO(today, null, null, null)
                : new DailyAchievementDTO(today, todayTotal, todayDone);

        return new AchievementOverviewResponseDTO(last7Days, todayAchievement);
    }
}

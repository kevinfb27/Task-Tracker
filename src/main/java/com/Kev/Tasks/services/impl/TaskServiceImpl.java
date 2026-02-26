package com.Kev.Tasks.services.impl;

import com.Kev.Tasks.domain.entities.Task;
import com.Kev.Tasks.domain.entities.TaskList;
import com.Kev.Tasks.domain.entities.TaskPriority;
import com.Kev.Tasks.domain.entities.TaskStatus;
import com.Kev.Tasks.repositories.TaskListRepository;
import com.Kev.Tasks.repositories.TaskRepository;
import com.Kev.Tasks.services.TaskService;
import jakarta.transaction.Transactional;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    private final TaskListRepository taskListRepository;

    public TaskServiceImpl(TaskRepository taskRepository, TaskListRepository taskListRepository) {
        this.taskRepository = taskRepository;
        this.taskListRepository = taskListRepository;
    }


    @Override
    public List<Task> listTasks(UUID taskListId) {
        return taskRepository.findByTaskListId(taskListId);
    }
    @Transactional
    @Override
    public Task createTask(UUID taskListId, Task task) {
        if (null != task.getId()) {

            throw new IllegalArgumentException("Task already has an ID!");

        }

        if (null == task.getTitle() || task.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task must have a title");

        }

        TaskPriority taskPriority = Optional.ofNullable(task.getPriority())
                .orElse(TaskPriority.MEDIUM);

        TaskStatus taskStatus = TaskStatus.OPEN;

        TaskList taskList = taskListRepository.findById(taskListId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Task List ID provided! "));

        LocalDateTime now = LocalDateTime.now();

        Task taskToSave = new Task(
                null,
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                taskStatus,
                taskPriority,
                taskList,
                now,
                now

        );

        return taskRepository.save(taskToSave);


    }

    @Override
    public Optional<Task> getTask(UUID taskListId, UUID taskId) {
        return taskRepository.findByTaskListIdAndId(taskListId, taskId);
    }
    @Transactional
    @Override
    public Task updateTask(UUID taskListId, UUID taskId, Task task) {
        if (null == task.getId()) {
            throw new IllegalArgumentException("Task must have an ID");


        }
        if (!Objects.equals(taskId, task.getId())) {

            throw new IllegalArgumentException("Task id do not match");

        }
        if (null == task.getPriority()) {

            throw new IllegalArgumentException("Task must have a valid priority");

        }
        if (null == task.getStatus()) {

            throw new IllegalArgumentException("Task must have a valid status");

        }

      Task existingTask =  taskRepository.findByTaskListIdAndId(taskListId, taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        existingTask.setTitle(task.getTitle());
        existingTask.setDescription(task.getDescription());
        existingTask.setDueDate(task.getDueDate());
        existingTask.setPriority(task.getPriority());
        existingTask.setStatus(task.getStatus());
        existingTask.setUpdated(LocalDateTime.now());

       return taskRepository.save(existingTask);
    }
    @Transactional
    @Override
    public void deleteTask(UUID taskListId, UUID taskId) {
        taskRepository.deleteByTaskListIdAndId(taskListId,taskId);
    }





}

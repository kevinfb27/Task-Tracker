package com.Kev.Tasks.mappers.impl;

import com.Kev.Tasks.domain.entities.TaskList;
import com.Kev.Tasks.repositories.TaskListRepository;
import com.Kev.Tasks.services.TaskListService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class TaskListServiceImpl  implements TaskListService {

    private final TaskListRepository taskListRepository;

    public TaskListServiceImpl(TaskListRepository taskListRepository) {
        this.taskListRepository = taskListRepository;
    }


    @Override
    public List<TaskList> listTaskLists() {
        return taskListRepository.findAll();
    }

    @Override
    public TaskList createTaskList(TaskList taskList) {
        if(null!= taskList.getId()){

            throw new IllegalArgumentException("Task list already has and ID");

        }
        if(null == taskList.getTitle() || taskList.getTitle().isBlank()){

            throw  new IllegalArgumentException("Task list title must be present!");


        }
        LocalDateTime now = LocalDateTime.now();
        return taskListRepository.save(new TaskList(
                null,
                taskList.getTitle(),
                taskList.getDescription(),
                null,
                now,
                now

        ));



    }

    @Override
    public Optional<TaskList> getTaskList(UUID id) {
        return taskListRepository.findById(id);
    }


    @Transactional
    @Override
    public TaskList updateTaskList(UUID taskListId, TaskList taskList) {
        if(null==taskList.getId()){

            throw new IllegalArgumentException("Task list must have an ID");
        }
        if (!Objects.equals(taskList.getId(),taskListId)){

            throw new IllegalArgumentException("Attempting to change task list ,OD , this is not permitted!");


        }

    TaskList existinTaskList =  taskListRepository.findById(taskListId).orElseThrow(()->
                new IllegalArgumentException("Task List not found!"));

            existinTaskList.setTitle(taskList.getTitle());
            existinTaskList.setDescription(taskList.getDescription());
            existinTaskList.setUpdated(LocalDateTime.now());
            return taskListRepository.save(existinTaskList);

    }

    @Override
    public void deleteTaskList(UUID taskListId) {
        taskListRepository.deleteById(taskListId);
    }
}

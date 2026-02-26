package com.Kev.Tasks.controllers;

import com.Kev.Tasks.domain.dto.TaskListDto;
import com.Kev.Tasks.domain.entities.TaskList;
import com.Kev.Tasks.mappers.TaskListMapper;
import com.Kev.Tasks.services.TaskListService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping(path ="/api/task-lists")
public class TaskListController {

    private final TaskListService taskListService;
    private final TaskListMapper taskListMapper;

    public TaskListController(TaskListService taskListService, TaskListMapper taskListMapper) {
        this.taskListService = taskListService;
        this.taskListMapper = taskListMapper;
    }

    @GetMapping
    public List<TaskListDto>listTaskLists(){

      return  taskListService.listTaskLists()
                .stream()
                .map(taskListMapper::toDto)
                .toList();

    }

     @PostMapping
    public TaskListDto createTaskList(@RequestBody TaskListDto taskListDto){
        TaskList createdTaskList= taskListService.createTaskList(

                taskListMapper.fromDto(taskListDto)

        );

        return taskListMapper.toDto(createdTaskList);


     }
     @GetMapping(path ="/{task_list_id}")
     public Optional<TaskListDto>getTaskList(@PathVariable("task_list_id")UUID tasklistId){


        return taskListService.getTaskList(tasklistId).map(taskListMapper::toDto);

     }

     @PutMapping(path = "/{task_list_id}")
    public TaskListDto updateTaskList(

             @PathVariable("task_list_id")UUID taskLIstId,
             @RequestBody TaskListDto taskListDto

     ){

        TaskList  updatedTaskList =  taskListService.updateTaskList(

                    taskLIstId,
                    taskListMapper.fromDto(taskListDto)


            );

            return taskListMapper.toDto(updatedTaskList);

     }

     @DeleteMapping(path = "/{task_list_id}")
     public void  deleteTaskList(@PathVariable("task_list_id")UUID taskListId   ){

        taskListService.deleteTaskList(taskListId);


     }





}

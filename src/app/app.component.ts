import { Component, OnInit, Inject } from '@angular/core';
import { APIService } from './apiservice.service';
import { Project } from './Project';
import { Todo } from './Todo';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  projects: Project[];
  breakpoint: number;

  constructor(private apiService: APIService, public dialog: MatDialog) {
    this.projects = [];
    if (window.innerWidth >= 1600) {
      this.breakpoint = 3;
    } else if (window.innerWidth >= 1100) {
      this.breakpoint = 2;
    } else {
      this.breakpoint = 1;
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(Dialog, {
      data: this.projects,
      disableClose: true,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.fetchProjects().subscribe((result) => {
          this.projects = result;
        });
      }
    });
  }

  onResize(event: any) {
    console.log(event.target.innerWidth);
    if (event.target.innerWidth >= 1600) {
      this.breakpoint = 3;
    } else if (event.target.innerWidth >= 1100) {
      this.breakpoint = 2;
    } else {
      this.breakpoint = 1;
    }
  }

  updateTodo(project: Project, todo: Todo) {
    this.apiService.patchTodo(project, todo).subscribe((result) => {
      let isCompleted = result
        ? (todo.isCompleted = !todo.isCompleted)
        : todo.isCompleted;
      let projectIndex = this.projects.indexOf(project);
      let todoIndex = this.projects[projectIndex].todos.indexOf(todo);
      this.projects[projectIndex].todos[todoIndex].isCompleted = isCompleted;
    });
  }

  ngOnInit(): void {
    this.apiService.fetchProjects().subscribe((result) => {
      this.projects = result;
    });
  }
}

@Component({
  selector: 'todo-create-dialog',
  templateUrl: 'dialog.html',
  styleUrls: ['dialog.css'],
})
export class Dialog {
  projectForm = new FormGroup({
    text: new FormControl('', [Validators.required]),
    project: new FormControl('', [Validators.required]),
    projectTitle: new FormControl('', [Validators.required]),
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) public projects: Project[],
    private apiService: APIService,
    public dialogRef: MatDialogRef<Dialog>
  ) {}

  onCreateClick(): void {
    if (
      this.projectForm.value.text &&
      this.projectForm.value.project === 'new'
    ) {
      if (this.projectForm.valid) {
        this.apiService
          .createTodo(
            new Project(-1, this.projectForm.value.projectTitle, []),
            new Todo(-1, this.projectForm.value.text, false)
          )
          .subscribe((result) => {
            console.log(result);
            this.dialogRef.close('changed');
          });
      } else {
        this.projectForm.markAllAsTouched();
      }
    } else if (this.projectForm.value.text && this.projectForm.value.project) {
      this.apiService
        .createTodo(
          new Project(this.projectForm.value.project, '', []),
          new Todo(-1, this.projectForm.value.text, false)
        )
        .subscribe((result) => {
          this.dialogRef.close('changed');
        });
    } else {
      this.projectForm.markAllAsTouched();
    }
  }
}

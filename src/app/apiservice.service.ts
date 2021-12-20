import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CONFIG } from './app.config';
import { Project } from './Project';
import { Todo } from './Todo';
import { Result } from './Result';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class APIService {
  private apiURL: string;
  private fetchProjectsURL: string;
  private patchTodoURL: string;
  private createTodoURL: string;
  private httpOptions: Object;

  constructor(private http: HttpClient) {
    this.apiURL = CONFIG.apiURL;
    this.fetchProjectsURL = this.apiURL + '/projects';
    this.createTodoURL = this.apiURL + '/todos';
    this.patchTodoURL = this.apiURL + '/projects/';
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }

  fetchProjects(): Observable<Project[]> {
    return new Observable((observer) => {
      this.http
        .get<Result>(this.fetchProjectsURL, this.httpOptions)
        .subscribe((result: Result) => {
          if (result['data']) {
            let data: Project[] = result['data'];
            let projects = plainToInstance(Project, data);
            observer.next(projects);
          } else {
            observer.next([]);
          }
          observer.complete();
        });
    });
  }

  patchTodo(project: Project, todo: Todo): Observable<boolean> {
    return new Observable((observer) => {
      this.http
        .patch<Result>(
          this.patchTodoURL +
            project.id.toString() +
            '/todos/' +
            todo.id.toString(),
          this.httpOptions
        )
        .subscribe((result: Result) => {
          if (result['status'] && result['status'] === 'ok') {
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        });
    });
  }

  createTodo(project: Project, todo: Todo): Observable<boolean> {
    return new Observable((observer) => {
      let body = {};
      if (project.id === -1) {
        body = {
          project: { title: project.title },
          todo: { text: todo.text, isCompleted: todo.isCompleted },
        };
      } else {
        body = {
          id_project: project.id,
          todo: { text: todo.text, isCompleted: todo.isCompleted },
        };
      }
      this.http
        .post<Result>(
          this.createTodoURL,
          JSON.stringify(body),
          this.httpOptions
        )
        .subscribe((result: Result) => {
          if (result['status'] && result['status'] === 'ok') {
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        });
    });
  }
}

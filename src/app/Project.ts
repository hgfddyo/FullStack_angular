import { Todo } from './Todo';
import { Type } from 'class-transformer';

export class Project {
  id: number;
  title: string;

  @Type(() => Todo)
  todos: Todo[];

  constructor(id: number, title: string, todos: Todo[]) {
    this.title = title;
    this.todos = todos;
    this.id = id;
  }
}

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { signalHistory } from 'ngxtension/signal-history';

@Component({
	selector: 'app-signal-history',
	template: `
		<style>
			:host {
				font-family: sans-serif;
			}

			ul {
				list-style: none;
				padding: 0;

				li {
					margin-bottom: 10px;
					border: 1px solid black;
					padding: 10px;
				}
			}

			.todos {
				padding: 20px;
			}

			input {
				/*width: 100%;*/
				padding: 10px;
			}

			button {
				padding: 10px;
				border: 1px solid black;
				background-color: black;
				color: white;
			}

			button:disabled {
				background-color: gray;
				color: lightgray;
			}

			.todo {
				display: flex;
				align-items: center;
				gap: 10px;

				margin-bottom: 10px;
			}

			input[type='checkbox'] {
				margin-right: 10px;
				padding: 5px;
			}
		</style>
		<div
			style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; align-items: start"
		>
			<div class="todos">
				<div>Todos</div>
				<hr />

				<div style="margin-bottom: 20px">
					<input [(ngModel)]="newTodoTitle" />
					<button (click)="addTodo(newTodoTitle())">Add Todo</button>
				</div>

				@for (todo of todos(); track todo.id) {
					<div class="todo">
						<input
							[ngModel]="todo.completed"
							(ngModelChange)="toggleTodo(todo.id, $event)"
							type="checkbox"
						/>
						<span>{{ todo.title }}</span>
						<button (click)="removeTodo(todo.id)">Remove</button>
					</div>
				}
			</div>

			<div style="padding: 20px">
				<div>Todos History</div>
				<hr />
				<button
					[disabled]="!todosHistory.canRedo()"
					(click)="todosHistory.redo()"
				>
					Redo
				</button>
				<button
					[disabled]="!todosHistory.canUndo()"
					(click)="todosHistory.undo()"
				>
					Undo
				</button>

				<ul>
					@for (item of todosHistory.history(); track item.timestamp) {
						<li>{{ item.timestamp }}; Items: {{ item.value | json }}</li>
					}
				</ul>
			</div>
		</div>

		<div>
			<h1>Signal History</h1>
			<div>
				<h2>With String</h2>
				<div>
					<input [(ngModel)]="withString" />
					<br />

					<button
						(click)="withStringHistory.undo()"
						[disabled]="!withStringHistory.canUndo()"
					>
						Undo
					</button>
					<button
						(click)="withStringHistory.redo()"
						[disabled]="!withStringHistory.canRedo()"
					>
						Redo
					</button>
					<button (click)="withStringHistory.reset()">Reset</button>
					<button (click)="withStringHistory.clear()">Clear</button>
				</div>
				<div>
					History:
					<pre>{{ withStringHistory.history() | json }}</pre>
				</div>
			</div>

			<div>
				<h2>With Number</h2>
				<div>
					<input type="number" [(ngModel)]="withNumber" />
					<br />

					<button
						(click)="withNumberHistory.undo()"
						[disabled]="!withNumberHistory.canUndo()"
					>
						Undo
					</button>
					<button
						(click)="withNumberHistory.redo()"
						[disabled]="!withNumberHistory.canRedo()"
					>
						Redo
					</button>
					<button (click)="withNumberHistory.reset()">Reset</button>
					<button (click)="withNumberHistory.clear()">Clear</button>
				</div>
				<div>
					History:
					<pre>{{ withNumberHistory.history() | json }}</pre>
				</div>
			</div>

			<div>
				<h2>With Boolean</h2>
				<div>
					<input type="checkbox" [(ngModel)]="withBoolean" />
					<br />

					<button
						(click)="withBooleanHistory.undo()"
						[disabled]="!withBooleanHistory.canUndo()"
					>
						Undo
					</button>
					<button
						(click)="withBooleanHistory.redo()"
						[disabled]="!withBooleanHistory.canRedo()"
					>
						Redo
					</button>
					<button (click)="withBooleanHistory.reset()">Reset</button>
					<button (click)="withBooleanHistory.clear()">Clear</button>
				</div>
				<div>
					History:
					<pre>{{ withBooleanHistory.history() | json }}</pre>
				</div>
			</div>

			<div>
				<h2>With Object</h2>
				<div>
					<div>
						{{ withObject() | json }}
					</div>
					<button (click)="withObject.set({})">Set Empty Object</button>
					<button (click)="withObject.set({ foo: 'bar' })">Set Object</button>
					<br />

					<button
						(click)="withObjectHistory.undo()"
						[disabled]="!withObjectHistory.canUndo()"
					>
						Undo
					</button>
					<button
						(click)="withObjectHistory.redo()"
						[disabled]="!withObjectHistory.canRedo()"
					>
						Redo
					</button>
					<button (click)="withObjectHistory.reset()">Reset</button>
					<button (click)="withObjectHistory.clear()">Clear</button>
				</div>
				<div>
					History:
					<pre>{{ withObjectHistory.history() | json }}</pre>
				</div>
			</div>

			<div>
				<h2>With Array</h2>
				<div>
					<div>
						{{ withArray() | json }}
					</div>
					<button (click)="withArray.set(['foo'])">Set Array</button>
					<button (click)="withArray.set(['bar'])">Set Array 2</button>
					<button (click)="withArray.set([])">Set Empty Array</button>
					<br />

					<button
						(click)="withArrayHistory.undo()"
						[disabled]="!withArrayHistory.canUndo()"
					>
						Undo
					</button>
					<button
						(click)="withArrayHistory.redo()"
						[disabled]="!withArrayHistory.canRedo()"
					>
						Redo
					</button>
					<button (click)="withArrayHistory.reset()">Reset</button>
					<button (click)="withArrayHistory.clear()">Clear</button>
				</div>
				<div>
					History:
					<pre>{{ withArrayHistory.history() | json }}</pre>
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [FormsModule, JsonPipe],
	standalone: true,
})
export default class SignalHistoryComponent {
	readonly newTodoTitle = signal('');

	readonly todos = signal<Todo[]>([]);
	readonly todosHistory = signalHistory(this.todos);

	// todosHistory.history(); - All history
	// todosHistory.undo() - Undo last action
	// todosHistory.redo() - Redo last action
	// todosHistory.canUndo() - Can undo
	// todosHistory.canRedo() - Can redo
	// todosHistory.clear() - Clear history
	// todosHistory.reset() - Reset the history to the current state.

	addTodo(todo: string) {
		if (!todo) return;

		this.todos.update((todos) => [
			...todos,
			{ id: todos.length + 1, title: todo, completed: false },
		]);

		this.newTodoTitle.set('');
	}

	removeTodo(id: number) {
		this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
	}

	toggleTodo(id: number, completed: boolean) {
		this.todos.update((todos) =>
			todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
		);
	}

	withString = signal('');
	withNumber = signal(0);
	withBoolean = signal(false);
	withObject = signal({});
	withArray = signal<string[]>([]);

	withStringHistory = signalHistory(this.withString);
	withNumberHistory = signalHistory(this.withNumber);
	withBooleanHistory = signalHistory(this.withBoolean);
	withObjectHistory = signalHistory(this.withObject);
	withArrayHistory = signalHistory(this.withArray);
}

interface Todo {
	id: number;
	title: string;
	completed: boolean;
}

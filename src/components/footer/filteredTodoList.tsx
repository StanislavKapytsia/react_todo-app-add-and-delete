import { useCallback } from 'react';
import { TodoInterface } from '../../types/Todo';
import cn from 'classnames';

interface Props {
  todos: TodoInterface[];
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  filter: string;
  deleteTodos: (content: number[] | number) => Promise<void>;
}

export const FilteredTodoList: React.FC<Props> = ({
  todos,
  setFilter,
  filter,
  deleteTodos,
}) => {
  const countNotCompletedItem = useCallback(() => {
    const filtered = todos.filter(todo => !todo.completed);

    return filtered.length;
  }, [todos]);

  const notCompletedItem = countNotCompletedItem();

  const handledeleteTodos = () => {
    const completedTodosId = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    deleteTodos(completedTodosId);
  };

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${notCompletedItem} items left`}
      </span>

      {/* Active link should have the 'selected' class */}
      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={cn('filter__link', { selected: filter === 'all' })}
          data-cy="FilterLinkAll"
          onClick={() => {
            setFilter('all');
          }}
        >
          All
        </a>

        <a
          href="#/active"
          className={cn('filter__link', { selected: filter === 'active' })}
          data-cy="FilterLinkActive"
          onClick={() => {
            setFilter('active');
          }}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={cn('filter__link', { selected: filter === 'completed' })}
          data-cy="FilterLinkCompleted"
          onClick={() => {
            setFilter('completed');
          }}
        >
          Completed
        </a>
      </nav>

      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        onClick={handledeleteTodos}
        disabled={todos.length - notCompletedItem === 0}
      >
        Clear completed
      </button>
    </footer>
  );
};

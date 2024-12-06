import { useCallback } from 'react';
import { TodoInterface } from '../../types/Todo';
import cn from 'classnames';
import { Filter } from '../../types/filter';

interface Props {
  todos: TodoInterface[];
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  filter: string;
  deleteTodos: (
    content: number[] | number,
    addData?: HTMLDivElement,
  ) => Promise<void>;
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

      <nav className="filter" data-cy="Filter">
        {(Object.values(Filter) as Filter[]).map(way => (
          <a
            key={way}
            href="#/"
            className={cn('filter__link', { selected: filter === way })}
            data-cy={`FilterLink${way}`}
            onClick={() => {
              setFilter(way);
            }}
          >
            {way}
          </a>
        ))}
      </nav>

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

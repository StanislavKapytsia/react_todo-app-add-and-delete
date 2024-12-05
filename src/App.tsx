import React, { useEffect, useRef, useState } from 'react';
import { addTodo, delTodo, get } from './api/todos';
import { TodoList } from './components/todoList/todoList';
import { TodoInterface } from './types/Todo';
import { FilteredTodoList } from './components/footer/filteredTodoList';

export const App: React.FC = () => {
  //#region: variables **********
  const [todos, setTodos] = useState<TodoInterface[]>([]);
  const [filter, setFilter] = useState('all');
  const [value, setValue] = useState('');
  const [tempTodo, setTempTodo] = useState<TodoInterface | null>(null);

  // To add class 'is-active' for all todo.completed before delete
  const [applyDeleteTodos, setApplyDeleteTodos] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const inputForFocusRef = useRef<HTMLInputElement>(null);

  // To add class 'hidden' for "ErrorNotification"
  const notificationRef = useRef<HTMLDivElement>(null);

  //#endregion: variables **********

  //#region: additional functions **********

  const hideNotification = () => {
    if (notificationRef.current) {
      notificationRef.current.classList.add('hidden');
    }
  };

  function errorHandling(error: Error) {
    if (notificationRef.current) {
      notificationRef.current.classList.remove('hidden');
      setErrorMessage(error.message);
      setTimeout(() => {
        if (notificationRef.current) {
          notificationRef.current.classList.add('hidden');
        }
      }, 3000);
    }
  }

  const newId = () => {
    const maxId = Math.max(0, ...todos.map(todo => todo.id));

    return maxId + 1;
  };

  const errorManagement = (er: unknown) => {
    if (er instanceof Error) {
      errorHandling(er);
    }
  };

  const createTodo = (id: number, title: string): TodoInterface => ({
    id,
    userId: 2039,
    title: title.trim(),
    completed: false,
  });

  //#endregion: additional  functions **********

  //#region: Loading Delete, Add **********

  useEffect(() => {
    if (inputForFocusRef.current) {
      inputForFocusRef.current.focus();
    }

    const fetchTodos = async () => {
      try {
        hideNotification();

        const data = await get();

        setTodos(data);
      } catch (error) {
        if (error instanceof Error) {
          errorHandling(error);
        }
      }
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    if (inputForFocusRef.current) {
      inputForFocusRef.current.focus();
    }
  });

  const deleteTodos = async (
    content: number[] | number,
    addData: HTMLDivElement,
  ) => {
    // deleteTodos have been used twice for single and group delete
    try {
      hideNotification();
      // deleteTodos for group delete
      if (Array.isArray(content)) {
        setApplyDeleteTodos(true);

        const deletePromises = content.map(deleteId => delTodo(deleteId));
        const results = await Promise.allSettled(deletePromises);
        // found this setting in web(
        const successfullyDeletedIds = results
          .filter(result => result.status === 'fulfilled')
          .map((_, index) => content[index]);

        setTodos(current =>
          current.filter(item => !successfullyDeletedIds.includes(item.id)),
        );

        const hasErrors = results.some(result => result.status === 'rejected');

        if (hasErrors) {
          throw new Error('Unable to delete a todo');
        }
      } else {
        // deleteTodos for single delete
        await delTodo(content);

        setTodos(current => current.filter(item => item.id !== content));
      }
    } catch (error) {
      errorManagement(error);
    } finally {
      setApplyDeleteTodos(false);
      setTimeout(() => {
        addData.classList.remove('is-active');
      }, 500);
    }
  };

  const addTodos = async (data: string) => {
    if (inputForFocusRef.current) {
      inputForFocusRef.current.focus();
    }

    setTempTodo(() => createTodo(0, data));

    try {
      hideNotification();

      await addTodo(data);

      const newTodo = createTodo(newId(), data);

      setTodos(current => [...current, newTodo]);

      setValue('');
    } catch (error) {
      errorManagement(error);
      setValue(value);
    } finally {
      setTempTodo(null);
    }
  };

  //#endregion: Loading Delete, Add **********

  //#region: more additional  functions **********

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (value.trim()) {
      addTodos(value);
    } else {
      const empty = new Error('Title should not be empty');

      errorHandling(empty);
      setValue('');
    }
  };

  const handleClose = () => {
    if (notificationRef.current) {
      notificationRef.current.classList.add('hidden');
    }
  };

  const filteredTodos = (): TodoInterface[] => {
    return todos.filter(todo => {
      switch (filter) {
        case 'all':
          return true;
        case 'active':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        default:
          return true;
      }
    });
  };

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (notificationRef.current) {
      notificationRef.current.classList.add('hidden');
    }

    setValue(e.target.value);
  };

  //#endregion: more additional  functions **********

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={onSubmit}>
            <input
              ref={inputForFocusRef}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={value}
              onChange={handleChangeValue}
              disabled={tempTodo !== null}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <TodoList
            filteredTodos={filteredTodos()}
            deleteTodos={deleteTodos}
            applyDeleteTodos={applyDeleteTodos}
            tempTodo={tempTodo}
          />
        )}

        {todos.length > 0 && (
          <FilteredTodoList
            todos={todos}
            setFilter={setFilter}
            filter={filter}
            deleteTodos={deleteTodos}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}

      <div
        ref={notificationRef}
        data-cy="ErrorNotification"
        className="notification 
        is-danger is-light has-text-weight-normal hidden"
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={handleClose}
        />
        {errorMessage}
      </div>
    </div>
  );
};

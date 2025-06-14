import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema } from '../schemas';
import useTodoStore from '../store';

const TodoForm = () => {
  const addTodo = useTodoStore(state => state.addTodo);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(todoSchema),
  });

  const onSubmit = (data) => {
    const todoData = {
      title: data.title,
      description: data.description || "",
      dueDate: data.dueDate ? data.dueDate : null,
    };
    addTodo(todoData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px' }}>
      <div>
        <label htmlFor="title">Tytuł:</label>
        <input id="title" {...register('title')} />
        {errors.title && <p style={{ color: 'red' }}>{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="description">Opis:</label>
        <textarea id="description" {...register('description')} />
        {errors.description && <p style={{ color: 'red' }}>{errors.description.message}</p>}
      </div>
      <div>
        <label htmlFor="dueDate">Termin wykonania (opcjonalnie):</label>
        <input id="dueDate" type="date" {...register('dueDate')} />
        {errors.dueDate && <p style={{ color: 'red' }}>{errors.dueDate.message}</p>}
      </div>
      <button type="submit">Dodaj zadanie</button>
    </form>
  );
};

export default TodoForm;
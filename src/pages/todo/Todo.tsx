import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import db from '../../lib/firebase/firebase'
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
  addDoc,
  orderBy,
  FieldValue
} from "firebase/firestore";

type Task = {
  id: string,
  title: string,
  completed: boolean,
  timestamp: FieldValue
};

const Todo = () => {
  const [ tasks, setTasks ] = useState<Task[]>([]);

  // 全タスクの取得
  const fetchTodos = async () => {
    const col = collection(db, "tasks");
    const q = query(col, orderBy('timestamp', 'desc'))
    const snapshot = await getDocs(q);
    const taskList: Task[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Task));
    setTasks(taskList);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // タスク作成
  const title = useRef<HTMLInputElement>(null)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.current && title.current.value) {
      try {
        const docData = {
          title: title.current.value,
          completed: false,
          timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'tasks'), docData);
        title.current.value = '';
        fetchTodos();
      } catch(error) {
        console.error(error)
      }
    } else {
      alert('タスクを入力してください')
    }
  };

  // タスク編集
  const handleChange = (id: string, editedValue: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        task.title = editedValue;
        task.timestamp = serverTimestamp();
      };
      return task;
    });
    setTasks(newTasks);
  };

  const handleEdit = async (id: string) => {
    try {
      const updatedDocData = tasks.filter((task) => task.id === id)[0];
      await updateDoc(doc(db, "tasks", id), updatedDocData);
    } catch(error) {
      console.log(error);
    };
  }

  // タスク削除
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
    fetchTodos();
  }

  // タスク完了、未着手トグル
  const handleComplete = async (id: string) => {
    try {
      const newTasks = tasks.map((task) => {
        if (task.id === id) {
          task.completed = !task.completed
        };
        return task;
      });
      setTasks(newTasks);
      const updatedDocData = tasks.filter((task) => task.id === id)[0];
      await updateDoc(doc(db, "tasks", id), updatedDocData);
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <div className='container flex flex-col w-full'>
        <form onSubmit={(e) => handleSubmit(e)} className='flex gap-3 w-full'>
          <input className='py-3 px-4 border basis-5/6' type='text' ref={title} />
          <button className='py-3 px-4 bg-green-500 text-white basis-1/6' type='submit'>登録</button>
        </form>
        <div className='mt-5 border'>
          <ul className='px-5'>
            {tasks.map((task) => (
              <li key={task.id} className='flex justify-between gap-5 py-5 px-5 [&:not(:last-child)]:border-b'>
                <input
                  className='focus:outline-none bg-white w-full'
                  type='text'
                  value={task.title}
                  onChange={(e) => handleChange(task.id, e.target.value)}
                  disabled={task.completed}
                />
                <CheckIcon className={`${task.completed && 'text-green-500'}`} onClick={() => handleComplete(task.id)}/>
                {task.completed || <EditIcon className='cursor-pointer' onClick={(e) => handleEdit(task.id)} />}
                <DeleteIcon className='cursor-pointer' onClick={() => handleDelete(task.id)}/>
              </li>
            ))}
          </ul>
        </div>
    </div>
  )
}

export default Todo
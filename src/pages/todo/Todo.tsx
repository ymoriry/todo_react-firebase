import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
  addDoc
} from "firebase/firestore";

type Task = {
  id: string,
  title: string,
  status: string,
  timestamp: string
};

const Todo = () => {
  const [ inputValue, setInputValue ] = useState<string>('');
  const [ tasks, setTasks ] = useState<Task[]>([]);

  // 全タスクの取得
  useEffect(() => {
    const fetchTodos = async () => {
      const snapshot = await getDocs(collection(db, 'tasks'));
      const taskList: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      setTasks(taskList);
    };
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
          status: '未着手',
          timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'tasks'), docData);
        window.location.reload();
      } catch(error) {
        console.error(error)
      }
    } else {
      alert('タスクを入力してください')
    }
  };

  // タスク編集
  const handleEdit = async (id: string, editedValue: string) => {
    try {
      const updatedDocData = {
        title: editedValue,
        timestamp: serverTimestamp()
      };
      await updateDoc(doc(db, "tasks", id), updatedDocData);

      const newTasks = tasks.map((task) => {
        if ( task.id === id ) {
          task.title = editedValue;
        };
        return task;
      });
      setTasks(newTasks);
    } catch(error) {
      console.log(error);
    };
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
    window.location.reload();
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
              <li key={task.id} className='flex justify-between gap-3 py-5 px-5 border-b'>
                <input
                  className='focus:outline-none bg-white w-full'
                  type='text'
                  value={task.title}
                  onChange={(e) => handleEdit(task.id, e.target.value)}
                />
                <DeleteIcon className='cursor-pointer' onClick={() => handleDelete(task.id)}/>
              </li>
            ))}
          </ul>
        </div>
    </div>
  )
}

export default Todo
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  onSnapshot,
  deleteDoc,
  where,
  getDocs,
} from "firebase/firestore"; 
import { db } from './firebase';
import html2canvas from 'html2canvas';

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const itemsRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'pantryItems'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      const calculateTotal = () => {
        const totalQuantity = itemsArr.reduce((sum, item) => sum + item.quantity, 0);
        setTotal(totalQuantity);
      };
      calculateTotal();
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.quantity !== '') {
      const q = query(collection(db, 'pantryItems'), where('name', '==', newItem.name.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingItem = querySnapshot.docs[0];
        const existingItemRef = doc(db, 'pantryItems', existingItem.id);
        const updatedQuantity = existingItem.data().quantity + parseFloat(newItem.quantity);

        await updateDoc(existingItemRef, { quantity: updatedQuantity });
      } else {
        await addDoc(collection(db, 'pantryItems'), {
          name: newItem.name.trim(),
          quantity: parseFloat(newItem.quantity),
        });
      }

      setNewItem({ name: '', quantity: '' });
    }
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'pantryItems', id));
  };

  const exportAsPNG = async () => {
    const element = itemsRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = 'pantry_items.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsNote = () => {
    const itemsText = items.map(item => `${item.name}: ${item.quantity}`).join('\n');
    const blob = new Blob([itemsText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pantry_items.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">Pantry Tracker</h1>
        <form onSubmit={addItem} className="flex flex-col sm:flex-row items-center mb-6">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Enter Item"
            className="flex-grow p-2 border rounded-lg mb-4 sm:mb-0 sm:mr-4"
          />
          <input
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            placeholder="Enter Quantity"
            className="flex-grow p-2 border rounded-lg mb-4 sm:mb-0 sm:mr-4"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </form>
        <div className="flex mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Items"
            className="p-2 border rounded-lg flex-grow"
          />
        </div>
        <div ref={itemsRef}>
          <ul className="space-y-4">
            {filteredItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center p-4 bg-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <span className="text-lg font-medium">{item.name}</span>
                  <span className="text-lg font-medium mt-2 sm:mt-0 sm:ml-4">Quantity: {item.quantity}</span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {items.length > 0 && (
            <div className="mt-6 text-center">
              <span className="text-xl font-bold">Total Quantity: {total}</span>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={exportAsPNG}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Export as PNG
          </button>
          <button
            onClick={exportAsNote}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
          >
            Export as Note
          </button>
        </div>
      </div>
    </main>
  );
}

import './App.css'
import TodoComp from './pages/SundayInventory.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodoComp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

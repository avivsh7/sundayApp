import './App.css'
import SundayInventory from './pages/SundayInventory.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SundayInventory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

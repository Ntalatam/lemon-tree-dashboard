import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Neighborhoods from './pages/Neighborhoods'
import Feedback from './pages/Feedback'
import Reports from './pages/Reports'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-lt-bg">
        <Sidebar />
        <main className="flex-1 ml-60 p-8 max-w-[1400px]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/neighborhoods" element={<Neighborhoods />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

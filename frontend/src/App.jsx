import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Materials from './pages/Materials'
import Employees from './pages/Employees'
import Sales from './pages/Sales'
import Stock from './pages/Stock'
import Finance from './pages/Finance'
import Products from './pages/Products'
import OpeningBalance from './pages/OpeningBalance'

function App() {
  const { auth } = useApp()

  return (
    <BrowserRouter>
      {!auth.isLoggedIn ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="materials" element={<Materials />} />
            <Route path="employees" element={<Employees />} />
            <Route path="sales" element={<Sales />} />
            <Route path="stock" element={<Stock />} />
            <Route path="finance" element={<Finance />} />
            <Route path="products" element={<Products />} />
            <Route path="opening-balance" element={<OpeningBalance />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
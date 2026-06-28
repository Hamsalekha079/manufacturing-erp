import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
  const { auth } = useApp()

  if (!auth.isLoggedIn) {
    return <Login />
  }

  return (
    
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="materials" element={<Materials />} />
          <Route path="employees" element={<Employees />} />
          <Route path="sales" element={<Sales />} />
          <Route path="stock" element={<Stock />} />
          <Route path="finance" element={<Finance />} />
         <Route path="products" element={<Products />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminDashboard from './pages/AdminDashboard'
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import ResidentDashboard from './pages/ResidentDashboard'
import TrackComplaint from './pages/TrackComplaint'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="resident" element={<ResidentDashboard />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

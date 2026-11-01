import { Home, MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <div className="card">
        <EmptyState
          icon={MapPinOff}
          title="Page not found"
          message="The page you are looking for doesn't exist or has moved."
          action={<Button as={Link} to="/" icon={Home}>Back to home</Button>}
        />
      </div>
    </div>
  )
}

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/clinics')({
  component: AdminClinicsLayout,
})

function AdminClinicsLayout() {
  return <Outlet />
}
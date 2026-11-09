
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../feature/Auth/AuthPages/Login';
import Register from '../feature/Auth/AuthPages/Register';
import ForgotPassword from '../feature/Auth/AuthPages/ForgotPassword';
import ResetPassword from '../feature/Auth/AuthPages/ResetPassword';

import ProtectedRoute from '../core/component/ProtectedRoute';

// Admin Layout
import AdminLayout from '../feature/Admin/AdminLayout';

// Admin Pages
import AdminDashboard from '../feature/Admin/AdminPages/AdminDashboard';
import FloorPlanBuilder from '../feature/Admin/AdminPages/FloorPlanBuilder';
import AdminEvents from '../feature/Admin/AdminPages/AdminEvents';
import AdminApplications from '../feature/Admin/AdminPages/AdminApplications';

// Exhibitor Pages
import ExhibitorDashboard from '../feature/Exhibitor/ExhibitorPages/ExhibitorDashboard';
import ExhibitorProfile from '../feature/Exhibitor/ExhibitorPages/ExhibitorProfile';
import ExhibitorEvents from '../feature/Exhibitor/ExhibitorPages/ExhibitorEvents';
import MyApplications from '../feature/Exhibitor/ExhibitorPages/MyApplications';
import BoothSelection from '../feature/Exhibitor/ExhibitorPages/BoothSelection';
import MyBooths from '../feature/Exhibitor/ExhibitorPages/MyBooths';
import ExhibitorMessages from '../feature/Exhibitor/ExhibitorPages/ExhibitorMessages';

// Attendee Layout
import AttendeeLayout from '../feature/Attendee/AttendeeLayout';

// Attendee Pages
import AttendeeDashboard from '../feature/Attendee/AttendeeHome/AttendeeDashboard';
import AttendeeEvents from '../feature/Attendee/AttendeePages/AttendeeEvents';
import EventDetails from '../feature/Attendee/AttendeePages/EventDetails';
import MyRegistrations from '../feature/Attendee/AttendeePages/MyRegistrations';
import AttendeeProfile from '../feature/Attendee/AttendeePages/AttendeeProfile';

// Exhibitor Routes
const exhibitorRoutes = [
  ['/exhibitor/dashboard', <ExhibitorDashboard />],
  ['/exhibitor/profile', <ExhibitorProfile />],
  ['/exhibitor/events', <ExhibitorEvents />],
  ['/exhibitor/applications', <MyApplications />],
  ['/exhibitor/booth-selection/:eventId', <BoothSelection />],
  ['/exhibitor/my-booths', <MyBooths />],
  ['/exhibitor/messages', <ExhibitorMessages />],
];

function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="floor-plan" element={<FloorPlanBuilder />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="applications" element={<AdminApplications />} />
        </Route>

        {/* Exhibitor Routes */}
        {exhibitorRoutes.map(([path, page]) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRole="exhibitor">
                {page}
              </ProtectedRoute>
            }
          />
        ))}

        {/* Attendee Routes */}
        <Route
          path="/attendee"
          element={
            <ProtectedRoute allowedRole="attendee">
              <AttendeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AttendeeDashboard />} />
          <Route path="events" element={<AttendeeEvents />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="registrations" element={<MyRegistrations />} />
          <Route path="profile" element={<AttendeeProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;
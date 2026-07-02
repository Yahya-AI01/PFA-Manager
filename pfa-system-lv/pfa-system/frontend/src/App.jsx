import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SujetsList from './pages/SujetsList';
import SujetDetail from './pages/SujetDetail';
import MonProjet from './pages/student/MonProjet';
import Kanban from './pages/student/Kanban';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import EtudiantsView from './pages/EtudiantsView';
import MesSujets from './pages/professor/MesSujets';
import SujetForm from './pages/professor/SujetForm';
import ProjetsEncadres from './pages/professor/ProjetsEncadres';
import AdminUsers from './pages/admin/Users';
import AdminModules from './pages/admin/Modules';
import ImportEtudiants from './pages/ImportEtudiants';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sujets" element={<SujetsList />} />
        <Route path="/sujets/:id" element={<SujetDetail />} />

        {/* Project sub-pages — accessible to all members + prof */}
        <Route path="/projets/:projetId/kanban" element={<Kanban />} />
        <Route path="/projets/:projetId/chat" element={<Chat />} />
        <Route path="/projets/:projetId/documents" element={<Documents />} />

        {/* Étudiant */}
        <Route path="/mon-projet" element={
          <ProtectedRoute roles={['ETUDIANT']}><MonProjet /></ProtectedRoute>
        } />

        {/* Professeur */}
        <Route path="/mes-sujets" element={
          <ProtectedRoute roles={['PROFESSEUR']}><MesSujets /></ProtectedRoute>
        } />
        <Route path="/mes-sujets/nouveau" element={
          <ProtectedRoute roles={['PROFESSEUR']}><SujetForm /></ProtectedRoute>
        } />
        <Route path="/mes-sujets/:id/modifier" element={
          <ProtectedRoute roles={['PROFESSEUR']}><SujetForm /></ProtectedRoute>
        } />
        <Route path="/projets-encadres" element={
          <ProtectedRoute roles={['PROFESSEUR']}><ProjetsEncadres /></ProtectedRoute>
        } />
        <Route path="/etudiants" element={
          <ProtectedRoute roles={['PROFESSEUR', 'ADMIN']}><EtudiantsView /></ProtectedRoute>
        } />
        <Route path="/import-etudiants" element={
          <ProtectedRoute roles={['PROFESSEUR', 'ADMIN']}><ImportEtudiants /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/utilisateurs" element={
          <ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/admin/modules" element={
          <ProtectedRoute roles={['ADMIN']}><AdminModules /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

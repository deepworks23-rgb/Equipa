import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminLoginView } from './components/AdminLoginView';
import { CollaboratorFormModal } from './components/CollaboratorFormModal';
import { CollaboratorProfilePage } from './components/CollaboratorProfilePage';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PublicShowcaseView } from './components/PublicShowcaseView';
import {
  loadAdminSession,
  loadCollaborators,
  saveAdminSession,
  saveCollaborators,
  SEED_COLLABORATORS,
} from './data/seedCollaborators';
import {
  getPublicCollaboratorById,
  type Collaborator,
  type CollaboratorInput,
  type CollaboratorStatus,
} from './utils/talentLogic';

type RouteState =
  | { view: 'public' }
  | { view: 'admin' }
  | { view: 'profile'; collaboratorId: string };

function resolveRoute(): RouteState {
  if (typeof window === 'undefined') return { view: 'public' };
  const pathname = window.location.pathname;
  if (pathname.startsWith('/admin')) {
    return { view: 'admin' };
  }
  if (pathname.startsWith('/colaborador/')) {
    const rawId = pathname.slice('/colaborador/'.length).replace(/\/+$/, '');
    if (rawId) {
      return { view: 'profile', collaboratorId: decodeURIComponent(rawId) };
    }
  }
  return { view: 'public' };
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => resolveRoute());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    loadAdminSession(),
  );
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() =>
    loadCollaborators(),
  );

  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    collaborator: Collaborator | null;
  }>({ open: false, mode: 'create', collaborator: null });

  const [pendingDelete, setPendingDelete] = useState<Collaborator | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(resolveRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    saveCollaborators(collaborators);
  }, [collaborators]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const navigate = (nextPath: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setRoute(resolveRoute());
  };

  const handleAdminLoginSuccess = () => {
    saveAdminSession(true);
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    saveAdminSession(false);
    setIsAdminAuthenticated(false);
  };

  const handleSaveCollaborator = (input: CollaboratorInput, existingId?: string) => {
    const hireDate =
      input.data_contratacao?.trim() ||
      `${Number(input.ano_contratacao) || new Date().getFullYear()}-01-01`;
    const parsedYear = Number(hireDate.slice(0, 4)) || new Date().getFullYear();

    if (existingId) {
      setCollaborators((prev) =>
        prev.map((person) =>
          person.id === existingId
            ? {
                ...person,
                nome_completo: input.nome_completo,
                cargo: input.cargo,
                telefone: input.telefone,
                email: input.email,
                ano_contratacao: parsedYear,
                data_contratacao: hireDate,
                status: input.status,
                foto_perfil: input.foto_perfil,
                departamento: input.departamento,
                localizacao: input.localizacao,
                horario_atendimento: input.horario_atendimento,
                idiomas: input.idiomas,
                especialidades: input.especialidades,
                bio: input.bio,
              }
            : person,
        ),
      );
      setNotice(`Dados de ${input.nome_completo} atualizados.`);
    } else {
      const created: Collaborator = {
        id: `col-${Date.now()}`,
        nome_completo: input.nome_completo,
        cargo: input.cargo,
        telefone: input.telefone,
        email: input.email,
        ano_contratacao: parsedYear,
        data_contratacao: hireDate,
        status: input.status,
        foto_perfil: input.foto_perfil,
        departamento: input.departamento,
        localizacao: input.localizacao,
        horario_atendimento: input.horario_atendimento,
        idiomas: input.idiomas,
        especialidades: input.especialidades,
        bio: input.bio,
      };
      setCollaborators((prev) => [created, ...prev]);
      setNotice(`${input.nome_completo} adicionado à equipa.`);
    }

    setFormState({ open: false, mode: 'create', collaborator: null });
  };

  const handleStatusChange = (id: string, nextStatus: CollaboratorStatus) => {
    const target = collaborators.find((c) => c.id === id);
    if (!target || target.status === nextStatus) return;

    setCollaborators((prev) =>
      prev.map((person) =>
        person.id === id ? { ...person, status: nextStatus } : person,
      ),
    );
    setNotice(`Status de ${target.nome_completo} alterado para ${nextStatus}.`);
  };

  const handleConfirmDelete = (id: string) => {
    const target = collaborators.find((c) => c.id === id);
    setCollaborators((prev) => prev.filter((person) => person.id !== id));
    setPendingDelete(null);
    if (target) {
      setNotice(`${target.nome_completo} excluído.`);
    }
  };

  const handleResetSeed = () => {
    setCollaborators(SEED_COLLABORATORS);
    setNotice('Lista inicial restaurada (4 Ativos, 1 Férias, 1 Rescindido).');
  };

  return (
    <>
      {route.view === 'admin' ? (
        isAdminAuthenticated ? (
          <AdminDashboardView
            collaborators={collaborators}
            onOpenCreate={() =>
              setFormState({ open: true, mode: 'create', collaborator: null })
            }
            onEditCollaborator={(c) =>
              setFormState({ open: true, mode: 'edit', collaborator: c })
            }
            onRequestDelete={(c) => setPendingDelete(c)}
            onStatusChange={handleStatusChange}
            onLogout={handleAdminLogout}
            onResetSeed={handleResetSeed}
          />
        ) : (
          <AdminLoginView
            onSuccess={handleAdminLoginSuccess}
            onNavigatePublic={() => navigate('/')}
          />
        )
      ) : route.view === 'profile' ? (
        <CollaboratorProfilePage
          collaborator={getPublicCollaboratorById(collaborators, route.collaboratorId)}
          allCollaborators={collaborators}
          onSelectCollaborator={(id) => navigate(`/colaborador/${encodeURIComponent(id)}`)}
          onBackToShowcase={() => navigate('/')}
          onNavigateAdmin={() => navigate('/admin')}
        />
      ) : (
        <PublicShowcaseView
          collaborators={collaborators}
          onSelectCollaborator={(id) => navigate(`/colaborador/${encodeURIComponent(id)}`)}
          onNavigateAdmin={() => navigate('/admin')}
        />
      )}

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#111827] text-white px-4 py-3 rounded-lg shadow-level-3 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FE8100] shrink-0" aria-hidden="true" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Fechar notificação"
            className="ml-1 p-1 rounded hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {formState.open && (
        <CollaboratorFormModal
          mode={formState.mode}
          initialCollaborator={formState.collaborator}
          onClose={() =>
            setFormState({ open: false, mode: 'create', collaborator: null })
          }
          onSubmit={handleSaveCollaborator}
        />
      )}

      <DeleteConfirmModal
        collaborator={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

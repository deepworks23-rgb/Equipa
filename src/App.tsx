import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminLoginView } from './components/AdminLoginView';
import { CollaboratorFormModal } from './components/CollaboratorFormModal';
import { CollaboratorProfilePage } from './components/CollaboratorProfilePage';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PublicShowcaseView } from './components/PublicShowcaseView';
import { SEED_COLLABORATORS } from './data/seedCollaborators';
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
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/painel-admin' ||
    pathname.startsWith('/painel-admin/')
  ) {
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
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [publicCollaborators, setPublicCollaborators] = useState<Collaborator[]>(() =>
    SEED_COLLABORATORS.filter((person) => person.status !== 'Rescindido'),
  );
  const [adminCollaborators, setAdminCollaborators] = useState<Collaborator[]>([]);

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
    if (route.view === 'admin') {
      document.title = 'Painel Administrativo — Lecasu';
    } else {
      document.title = 'A Nossa Equipa — Lecasu · Energy and Engineering Solutions';
    }
  }, [route.view]);

  useEffect(() => {
    if (route.view === 'admin') return;
    let active = true;
    fetch('/api/public/collaborators', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { collaborators?: Collaborator[] };
      })
      .then((data) => {
        if (active && data?.collaborators) {
          setPublicCollaborators(data.collaborators);
        }
      })
      .catch(() => {
        // Keep current public roster on transient network errors
      });

    return () => {
      active = false;
    };
  }, [route.view]);

  useEffect(() => {
    if (route.view !== 'admin' || !adminToken) return;
    let active = true;

    fetch('/api/admin/collaborators', {
      headers: { Authorization: `Bearer ${adminToken}` },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (res.status === 401) {
          if (active) {
            setAdminToken(null);
            setNotice('Sessão expirada. Inicie sessão novamente.');
          }
          return null;
        }
        if (!res.ok) return null;
        return (await res.json()) as { collaborators?: Collaborator[] };
      })
      .then((data) => {
        if (active && data?.collaborators) {
          setAdminCollaborators(data.collaborators);
        }
      })
      .catch(() => {
        if (active) {
          setNotice('Não foi possível carregar os colaboradores.');
        }
      });

    return () => {
      active = false;
    };
  }, [route.view, adminToken]);

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

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
  };

  const handleAdminLogout = async () => {
    const tokenToRevoke = adminToken;
    setAdminToken(null);
    setAdminCollaborators([]);
    if (!tokenToRevoke) return;
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenToRevoke}` },
      });
    } catch {
      // Token cleared in memory regardless of network state
    }
  };

  const handleSaveCollaborator = async (input: CollaboratorInput, existingId?: string) => {
    if (!adminToken) return;
    const endpoint = existingId
      ? `/api/admin/collaborators/${encodeURIComponent(existingId)}`
      : '/api/admin/collaborators';
    const method = existingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(input),
      });

      if (res.status === 401) {
        setAdminToken(null);
        setNotice('Sessão expirada. Inicie sessão novamente.');
        return;
      }

      const data = (await res.json()) as { collaborators?: Collaborator[]; error?: string };
      if (!res.ok || !data.collaborators) {
        setNotice(data.error ?? 'Erro ao guardar colaborador.');
        return;
      }

      setAdminCollaborators(data.collaborators);
      setPublicCollaborators(data.collaborators.filter((p) => p.status !== 'Rescindido'));
      setFormState({ open: false, mode: 'create', collaborator: null });
      setNotice(
        existingId
          ? `Dados de ${input.nome_completo} atualizados.`
          : `${input.nome_completo} adicionado à equipa.`,
      );
    } catch {
      setNotice('Erro de ligação ao guardar colaborador.');
    }
  };

  const handleStatusChange = async (id: string, nextStatus: CollaboratorStatus) => {
    if (!adminToken) return;
    const target = adminCollaborators.find((c) => c.id === id);
    if (!target || target.status === nextStatus) return;

    try {
      const res = await fetch(`/api/admin/collaborators/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.status === 401) {
        setAdminToken(null);
        setNotice('Sessão expirada. Inicie sessão novamente.');
        return;
      }

      const data = (await res.json()) as { collaborators?: Collaborator[]; error?: string };
      if (!res.ok || !data.collaborators) {
        setNotice(data.error ?? 'Erro ao atualizar status.');
        return;
      }

      setAdminCollaborators(data.collaborators);
      setPublicCollaborators(data.collaborators.filter((p) => p.status !== 'Rescindido'));
      setNotice(`Status de ${target.nome_completo} alterado para ${nextStatus}.`);
    } catch {
      setNotice('Erro de ligação ao atualizar status.');
    }
  };

  const handleConfirmDelete = async (id: string) => {
    if (!adminToken) return;
    const target = adminCollaborators.find((c) => c.id === id);

    try {
      const res = await fetch(`/api/admin/collaborators/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.status === 401) {
        setAdminToken(null);
        setPendingDelete(null);
        setNotice('Sessão expirada. Inicie sessão novamente.');
        return;
      }

      const data = (await res.json()) as { collaborators?: Collaborator[]; error?: string };
      if (!res.ok || !data.collaborators) {
        setNotice(data.error ?? 'Erro ao excluir colaborador.');
        return;
      }

      setAdminCollaborators(data.collaborators);
      setPublicCollaborators(data.collaborators.filter((p) => p.status !== 'Rescindido'));
      setPendingDelete(null);
      if (target) {
        setNotice(`${target.nome_completo} excluído.`);
      }
    } catch {
      setNotice('Erro de ligação ao excluir colaborador.');
    }
  };

  const handleResetSeed = async () => {
    if (!adminToken) return;

    try {
      const res = await fetch('/api/admin/collaborators/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.status === 401) {
        setAdminToken(null);
        setNotice('Sessão expirada. Inicie sessão novamente.');
        return;
      }

      const data = (await res.json()) as { collaborators?: Collaborator[]; error?: string };
      if (!res.ok || !data.collaborators) {
        setNotice(data.error ?? 'Erro ao restaurar base.');
        return;
      }

      setAdminCollaborators(data.collaborators);
      setPublicCollaborators(data.collaborators.filter((p) => p.status !== 'Rescindido'));
      setNotice('Lista inicial restaurada (4 Ativos, 1 Férias, 1 Rescindido).');
    } catch {
      setNotice('Erro de ligação ao restaurar base.');
    }
  };

  return (
    <>
      {route.view === 'admin' ? (
        adminToken ? (
          <AdminDashboardView
            collaborators={adminCollaborators}
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
          collaborator={getPublicCollaboratorById(publicCollaborators, route.collaboratorId)}
          allCollaborators={publicCollaborators}
          onSelectCollaborator={(id) => navigate(`/colaborador/${encodeURIComponent(id)}`)}
          onBackToShowcase={() => navigate('/')}
        />
      ) : (
        <PublicShowcaseView
          collaborators={publicCollaborators}
          onSelectCollaborator={(id) => navigate(`/colaborador/${encodeURIComponent(id)}`)}
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

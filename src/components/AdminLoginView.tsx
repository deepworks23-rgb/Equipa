import { Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onNavigatePublic: () => void;
}

const DEMO_ADMIN_EMAIL = 'admin@meridian.corp';
const DEMO_ADMIN_PASS = 'Meridian2026!';

export function AdminLoginView({ onSuccess, onNavigatePublic }: AdminLoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError('Preencha o e-mail e a palavra-passe para aceder ao painel.');
      return;
    }

    if (trimmedEmail !== DEMO_ADMIN_EMAIL || password !== DEMO_ADMIN_PASS) {
      setError('Credenciais inválidas. Verifique o e-mail e a palavra-passe.');
      return;
    }

    setError(null);
    onSuccess();
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-6">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-level-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0F294A] text-white flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[#0F294A]">
              Painel Administrativo
            </h1>
            <p className="text-xs text-[#64748B]">
              Acesso restrito para gestão de colaboradores
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-login-email"
              className="block text-xs font-medium text-[#1E293B] mb-1.5"
            >
              E-mail
            </label>
            <input
              id="admin-login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="admin@meridian.corp"
              className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/20"
            />
          </div>

          <div>
            <label
              htmlFor="admin-login-password"
              className="block text-xs font-medium text-[#1E293B] mb-1.5"
            >
              Palavra-passe
            </label>
            <input
              id="admin-login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••••••"
              className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/20"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-[#991B1B] bg-[#FEE2E2] rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-sm font-medium transition-colors"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-3">
          <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs text-[#44474E]">
            <p className="font-semibold text-[#0F294A]">Credenciais de demonstração</p>
            <p className="mt-1 font-mono text-[11px] tabular-nums">
              E-mail: {DEMO_ADMIN_EMAIL}
            </p>
            <p className="font-mono text-[11px] tabular-nums">
              Palavra-passe: {DEMO_ADMIN_PASS}
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_ADMIN_EMAIL);
                setPassword(DEMO_ADMIN_PASS);
                setError(null);
              }}
              className="mt-2 text-xs font-semibold text-[#0058BE] hover:underline"
            >
              Preencher automaticamente
            </button>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePublic();
            }}
            className="block text-center text-xs font-medium text-[#64748B] hover:text-[#0F294A]"
          >
            ← Voltar à Vitrine Pública
          </a>
        </div>
      </div>
    </div>
  );
}

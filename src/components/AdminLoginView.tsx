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
        <div className="pb-5 border-b border-[#E2E8F0]">
          <img
            src="/assets/aistudio/logo-transparent_81b43745.png"
            alt="Lecasu — Energy and Engineering Solutions"
            className="h-10 w-auto object-contain"
          />
          <div className="mt-4 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#FFF4E5] border border-[#FFD6A8] text-[#C25900] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-[#111827]">
                Painel Administrativo
              </h1>
              <p className="text-xs text-[#64748B]">
                Acesso restrito para gestão de colaboradores
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="admin-login-email"
              className="block text-xs font-medium text-[#111827] mb-1.5"
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
              className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
            />
          </div>

          <div>
            <label
              htmlFor="admin-login-password"
              className="block text-xs font-medium text-[#111827] mb-1.5"
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
              className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
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
            className="w-full h-10 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-sm font-semibold transition-colors"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-3">
          <div className="rounded-lg bg-[#FFFAF5] border border-[#FFD6A8] p-3 text-xs text-[#44474E]">
            <p className="font-semibold text-[#111827]">Credenciais de demonstração</p>
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
              className="mt-2 text-xs font-semibold text-[#C25900] hover:underline"
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
            className="block text-center text-xs font-medium text-[#64748B] hover:text-[#111827]"
          >
            ← Voltar à Vitrine Pública
          </a>
        </div>
      </div>
    </div>
  );
}

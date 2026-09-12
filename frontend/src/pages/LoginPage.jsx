import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AuthLayout from '../layout/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { validateEmail } from '../services/helper.js';
import { apiErrorMessage } from '../services/axiosInstance.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  usePageMeta({ title: t('auth.signInTitle') });

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setError(t('auth.errors.invalidEmail'));
      return;
    }
    if (!password) {
      setError(t('auth.errors.enterPassword'));
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signIn({ email, password });
      // Revenim acolo unde utilizatorul voia să ajungă, nu mereu pe pagina
      // de start.
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, t('auth.errors.generic')));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.welcomeBack')}
      subtitle={t('auth.loginSubtitle')}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            {t('auth.emailAddress')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ana@example.com"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{
              backgroundColor: 'var(--surface-sunken)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <PasswordInput
          id="password"
          label={t('auth.password')}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {error && (
          <p
            role="alert"
            className="text-sm"
            style={{ color: 'var(--color-signal-alert)' }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-60"
          style={{
            backgroundColor: 'var(--color-ember-400)',
            color: 'var(--color-ink-950)',
          }}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t('auth.signInAction')}
        </button>

        <p className="text-secondary text-sm">
          {t('auth.noAccount')}{' '}
          <Link
            to="/signup"
            className="font-semibold"
            style={{ color: 'var(--color-ember-500)' }}
          >
            {t('auth.signUpLink')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;

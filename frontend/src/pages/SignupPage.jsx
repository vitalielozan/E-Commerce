import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AuthLayout from '../layout/AuthLayout.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { validateEmail, validatePassword } from '../services/helper.js';
import { apiErrorMessage } from '../services/axiosInstance.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useAuthContext();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  usePageMeta({ title: t('auth.createAccount') });

  const onSubmit = async (event) => {
    event.preventDefault();

    if (fullName.trim().length < 2) {
      setError(t('auth.errors.enterName'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('auth.errors.invalidEmail'));
      return;
    }
    if (!validatePassword(password)) {
      setError(t('auth.errors.weakPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Înregistrarea întoarce deja un token, deci contul nou intră direct în
      // aplicație. Varianta anterioară arunca utilizatorul înapoi la login,
      // cerându-i să se autentifice cu datele tocmai introduse.
      await signUp({ fullName: fullName.trim(), email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, t('auth.errors.generic')));
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    backgroundColor: 'var(--surface-sunken)',
    color: 'var(--text-primary)',
  };

  return (
    <AuthLayout
      title={t('auth.createAccount')}
      subtitle={t('auth.signupSubtitle')}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
            {t('auth.fullName')}
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={fieldStyle}
          />
        </div>

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
            style={fieldStyle}
          />
        </div>

        <PasswordInput
          id="password"
          label={t('auth.password')}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showRequirements
        />

        <PasswordInput
          id="confirmPassword"
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
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
          {t('auth.signUpAction')}
        </button>

        <p className="text-secondary text-sm">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold"
            style={{ color: 'var(--color-ember-500)' }}
          >
            {t('auth.loginLink')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;

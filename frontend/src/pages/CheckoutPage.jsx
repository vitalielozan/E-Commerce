import { cloneElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { formatPrice } from '../services/format.js';
import {
  validateCardNumber,
  cardLast4,
  formatCardNumber,
} from '../services/helper.js';
import { ordersApi } from '../services/api.js';
import { apiErrorMessage } from '../services/axiosInstance.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { useCartFav } from '../hooks/useCartFav.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 19.99;

function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const { cart, isLoading: cartLoading } = useCartFav();

  const [submitting, setSubmitting] = useState(false);

  usePageMeta({ title: t('checkout.title') });

  const schema = yup.object({
    billingAddress: yup
      .string()
      .trim()
      .min(5, t('checkout.validation.addressTooShort'))
      .required(t('checkout.validation.billingRequired')),
    shippingAddress: yup
      .string()
      .trim()
      .min(5, t('checkout.validation.addressTooShort'))
      .required(t('checkout.validation.shippingRequired')),
    cardNumber: yup
      .string()
      .required(t('checkout.validation.cardRequired'))
      // Luhn prinde cifrele inversate, pe care o simplă verificare de
      // lungime le lasă să treacă.
      .test('luhn', t('checkout.validation.invalidCard'), validateCardNumber),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), mode: 'onBlur' });

  const cardNumber = watch('cardNumber', '');

  // Adresele salvate la comanda anterioară completează formularul.
  useEffect(() => {
    if (user?.lastCheckout) {
      reset({
        billingAddress: user.lastCheckout.billingAddress ?? '',
        shippingAddress: user.lastCheckout.shippingAddress ?? '',
        cardNumber: '',
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (authLoading || cartLoading) return;
    if (!user) navigate('/login', { replace: true });
    else if (cart.items.length === 0) navigate('/cart', { replace: true });
  }, [user, cart.items.length, authLoading, cartLoading, navigate]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Serverul primește doar ultimele patru cifre; numărul complet nu
      // părăsește browserul, pentru că nu are niciun motiv să o facă.
      const order = await ordersApi.create({
        billingAddress: values.billingAddress,
        shippingAddress: values.shippingAddress,
        cardLast4: cardLast4(values.cardNumber),
        saveDetails: true,
      });

      navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } });
    } catch (error) {
      toast.error(apiErrorMessage(error, t('checkout.failed')));
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading || !user || cart.items.length === 0) {
    return <div className="skeleton h-96 w-full rounded-xl" />;
  }

  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cart.subtotal + shipping;

  const fieldStyle = {
    backgroundColor: 'var(--surface-sunken)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold md:text-3xl">
        {t('checkout.title')}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <fieldset className="surface-panel space-y-4 p-5">
            <legend className="font-display px-1 text-sm font-semibold">
              {t('checkout.deliveryDetails')}
            </legend>

            <Field
              id="shippingAddress"
              label={t('checkout.shippingAddress')}
              error={errors.shippingAddress?.message}
            >
              <input
                id="shippingAddress"
                type="text"
                autoComplete="shipping street-address"
                {...register('shippingAddress')}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={fieldStyle}
                aria-invalid={Boolean(errors.shippingAddress)}
              />
            </Field>

            <Field
              id="billingAddress"
              label={t('checkout.billingAddress')}
              error={errors.billingAddress?.message}
            >
              <input
                id="billingAddress"
                type="text"
                autoComplete="billing street-address"
                {...register('billingAddress')}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={fieldStyle}
                aria-invalid={Boolean(errors.billingAddress)}
              />
            </Field>
          </fieldset>

          <fieldset className="surface-panel space-y-4 p-5">
            <legend className="font-display px-1 text-sm font-semibold">
              {t('checkout.payment')}
            </legend>

            <Field
              id="cardNumber"
              label={t('checkout.cardNumber')}
              error={errors.cardNumber?.message}
              hint={t('checkout.demoCardHint')}
            >
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                {...register('cardNumber')}
                onChange={(event) =>
                  setValue('cardNumber', formatCardNumber(event.target.value), {
                    shouldValidate: false,
                  })
                }
                value={cardNumber}
                className="tabular w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={fieldStyle}
                aria-invalid={Boolean(errors.cardNumber)}
              />
            </Field>

            <p className="text-muted flex items-start gap-2 text-xs leading-relaxed">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('checkout.privacyNote')}
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold disabled:opacity-60"
            style={{
              backgroundColor: 'var(--color-ember-400)',
              color: 'var(--color-ink-950)',
            }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting
              ? t('checkout.processing')
              : t('checkout.placeOrder', {
                  amount: formatPrice(total, i18n.language),
                })}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-panel space-y-4 p-5">
            <h2 className="font-display text-sm font-semibold">
              {t('checkout.orderSummary')}
            </h2>

            <ul className="space-y-3 text-sm" role="list">
              {cart.items.map((item) => (
                <li key={item._id} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate">{item.product.title}</span>
                    <span className="text-muted tabular text-xs">
                      &times;{item.quantity}
                    </span>
                  </span>
                  <span className="tabular shrink-0 font-medium">
                    {formatPrice(item.lineTotal, i18n.language)}
                  </span>
                </li>
              ))}
            </ul>

            <dl
              className="space-y-2 border-t pt-3 text-sm"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex justify-between">
                <dt className="text-secondary">{t('cart.subtotal')}</dt>
                <dd className="tabular">{formatPrice(cart.subtotal, i18n.language)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-secondary">{t('cart.shipping')}</dt>
                <dd className="tabular">
                  {shipping === 0
                    ? t('cart.freeShipping')
                    : formatPrice(shipping, i18n.language)}
                </dd>
              </div>
              <div
                className="flex justify-between border-t pt-2 text-base font-semibold"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <dt>{t('cart.total')}</dt>
                <dd className="tabular font-display">
                  {formatPrice(total, i18n.language)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Câmp cu etichetă, indiciu și eroare.
 *
 * Indiciul și eroarea sunt legate de input prin aria-describedby, altfel un
 * cititor de ecran anunță eticheta dar nu și motivul pentru care câmpul e
 * respins.
 */
function Field({ id, label, error, hint, children }) {
  const describedBy = [hint && !error && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      {describedBy
        ? cloneElement(children, { 'aria-describedby': describedBy })
        : children}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-muted mt-1 text-xs">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs"
          style={{ color: 'var(--color-signal-alert)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default CheckoutPage;

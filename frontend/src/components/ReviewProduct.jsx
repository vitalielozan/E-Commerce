import { useEffect, useState } from 'react';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import Rating from './Rating.jsx';
import { reviewsApi } from '../services/api.js';
import { apiErrorMessage } from '../services/axiosInstance.js';
import { formatDate } from '../services/format.js';
import { useAuthContext } from '../hooks/useAuthContext.js';

function ReviewProduct({ productId, onRatingChange }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    let active = true;
    setLoading(true);

    reviewsApi
      .forProduct(productId)
      .then((data) => active && setReviews(data))
      .catch(() => active && setReviews([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [productId]);

  // Recenzia proprie: serverul permite doar una per produs, deci formularul
  // se transformă în „șterge recenzia" odată ce există.
  const myReview = user
    ? reviews.find((review) => review.user?._id === user._id)
    : null;

  const submit = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const saved = await reviewsApi.add({ productId, comment, rating });
      setReviews((prev) => [saved, ...prev]);
      setComment('');
      setRating(5);
      onRatingChange?.();
      toast.success(t('reviews.published'));
    } catch (error) {
      toast.error(apiErrorMessage(error, t('reviews.failed')));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (reviewId) => {
    try {
      await reviewsApi.remove(reviewId);
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
      onRatingChange?.();
      toast.success(t('reviews.deleted'));
    } catch (error) {
      toast.error(apiErrorMessage(error, t('reviews.failed')));
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="space-y-5">
      <h2 id="reviews-heading" className="font-display text-xl font-semibold">
        {t('reviews.title')}
        {reviews.length > 0 && (
          <span className="text-muted ml-2 text-base font-normal">
            ({reviews.length})
          </span>
        )}
      </h2>

      {user ? (
        myReview ? (
          <p className="text-secondary text-sm">{t('reviews.alreadyReviewed')}</p>
        ) : (
          <form onSubmit={submit} className="surface-panel space-y-4 p-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                {t('reviews.yourRating')}
              </legend>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={t('reviews.starLabel', { count: star })}
                    aria-pressed={rating === star}
                    className="rounded p-1"
                  >
                    <Star
                      className="h-6 w-6"
                      style={{
                        color:
                          star <= rating
                            ? 'var(--color-ember-400)'
                            : 'var(--border-hairline)',
                      }}
                      fill={star <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="review-comment" className="mb-2 block text-sm font-medium">
                {t('reviews.yourReview')}
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                required
                minLength={3}
                maxLength={1000}
                placeholder={t('reviews.placeholder')}
                className="w-full rounded-lg p-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--surface-sunken)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-ember-400)',
                color: 'var(--color-ink-950)',
              }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('reviews.publish')}
            </button>
          </form>
        )
      ) : (
        <p className="text-secondary text-sm">{t('reviews.signInToReview')}</p>
      )}

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="surface-panel space-y-2 p-4">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted text-sm">{t('reviews.empty')}</p>
      ) : (
        <ul className="space-y-3" role="list">
          {reviews.map((review) => (
            <li key={review._id} className="surface-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {review.user?.fullName || t('common.anonymous')}
                </span>
                <time
                  className="text-muted text-xs"
                  dateTime={review.createdAt}
                >
                  {formatDate(review.createdAt, i18n.language)}
                </time>
              </div>

              <div className="mt-1.5">
                <Rating value={review.rating} count={1} showCount={false} />
              </div>

              <p className="text-secondary mt-2 text-sm leading-relaxed">
                {review.comment}
              </p>

              {myReview?._id === review._id && (
                <button
                  type="button"
                  onClick={() => remove(review._id)}
                  className="text-muted mt-3 flex items-center gap-1.5 text-xs font-medium hover:text-[var(--color-signal-alert)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('reviews.delete')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ReviewProduct;

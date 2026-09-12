import test from 'node:test';
import assert from 'node:assert/strict';

import {
  registerSchema,
  loginSchema,
} from '../src/controllers/authController.js';
import { addToCartSchema } from '../src/controllers/cartController.js';
import { createOrderSchema } from '../src/controllers/orderController.js';
import { listQuerySchema } from '../src/controllers/productController.js';
import { reviewSchema } from '../src/controllers/reviewController.js';

test('înregistrarea respinge parolele slabe', () => {
  const weak = ['short', 'nouppercase1!', 'NOLOWERCASE1!', 'NoDigits!!', 'NoSpecial1'];

  for (const password of weak) {
    const result = registerSchema.safeParse({
      fullName: 'Ana Pop',
      email: 'ana@example.com',
      password,
    });
    assert.equal(result.success, false, `„${password}" ar fi trebuit respinsă`);
  }
});

test('înregistrarea acceptă o parolă conformă și normalizează emailul', () => {
  const result = registerSchema.safeParse({
    fullName: '  Ana Pop  ',
    email: '  ANA@Example.COM ',
    password: 'Str0ng!Pass',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, 'ana@example.com');
  assert.equal(result.data.fullName, 'Ana Pop');
});

test('emailurile invalide sunt respinse', () => {
  // Validatorul anterior accepta „!!!" pentru că testa doar prezența unui
  // caracter special, nu structura adresei.
  for (const email of ['!!!', 'a.b', 'fara-arond', '@example.com', 'ana@']) {
    const result = loginSchema.safeParse({ email, password: 'x' });
    assert.equal(result.success, false, `„${email}" ar fi trebuit respins`);
  }
});

test('cantitatea din coș e convertită și limitată', () => {
  const ok = addToCartSchema.safeParse({
    productId: '507f1f77bcf86cd799439011',
    quantity: '3',
  });
  assert.equal(ok.success, true);
  assert.equal(ok.data.quantity, 3, 'șirul din corp devine număr');

  assert.equal(
    addToCartSchema.safeParse({
      productId: '507f1f77bcf86cd799439011',
      quantity: 0,
    }).success,
    false
  );

  assert.equal(
    addToCartSchema.safeParse({ productId: 'nu-e-objectid' }).success,
    false
  );
});

test('cantitatea implicită e 1', () => {
  const result = addToCartSchema.safeParse({
    productId: '507f1f77bcf86cd799439011',
  });
  assert.equal(result.data.quantity, 1);
});

test('comanda acceptă doar ultimele patru cifre ale cardului', () => {
  const base = {
    billingAddress: 'Str. Exemplu 12, Cluj',
    shippingAddress: 'Str. Exemplu 12, Cluj',
  };

  assert.equal(
    createOrderSchema.safeParse({ ...base, cardLast4: '4242' }).success,
    true
  );

  // Un număr complet de card nu trebuie să treacă de validare: serverul nu
  // are ce face cu el și nu trebuie să ajungă în jurnale.
  assert.equal(
    createOrderSchema.safeParse({ ...base, cardLast4: '4242424242424242' })
      .success,
    false
  );

  assert.equal(
    createOrderSchema.safeParse({ ...base, cardLast4: 'abcd' }).success,
    false
  );
});

test('interogarea catalogului are valori implicite și limite', () => {
  const empty = listQuerySchema.safeParse({});
  assert.equal(empty.success, true);
  assert.equal(empty.data.page, 1);
  assert.equal(empty.data.limit, 12);
  assert.equal(empty.data.sort, 'newest');

  // Limita maximă oprește cererile care ar descărca tot catalogul.
  assert.equal(listQuerySchema.safeParse({ limit: 500 }).success, false);
  assert.equal(listQuerySchema.safeParse({ sort: 'aleatoriu' }).success, false);

  const coerced = listQuerySchema.safeParse({ minPrice: '100', page: '2' });
  assert.equal(coerced.data.minPrice, 100);
  assert.equal(coerced.data.page, 2);
});

test('nota unei recenzii trebuie să fie între 1 și 5', () => {
  const base = {
    productId: '507f1f77bcf86cd799439011',
    comment: 'Imagine foarte bună.',
  };

  assert.equal(reviewSchema.safeParse({ ...base, rating: 5 }).success, true);
  assert.equal(reviewSchema.safeParse({ ...base, rating: 0 }).success, false);
  assert.equal(reviewSchema.safeParse({ ...base, rating: 6 }).success, false);
  assert.equal(reviewSchema.safeParse({ ...base, rating: 2.5 }).success, false);
  assert.equal(
    reviewSchema.safeParse({ ...base, rating: 3, comment: 'x' }).success,
    false,
    'comentariile prea scurte sunt respinse'
  );
});

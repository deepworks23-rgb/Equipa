import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  computeWorkforceMetrics,
  formatCompanyTenure,
  getAdminCollaborators,
  getDynamicPublicRoles,
  getInitials,
  getPublicCollaboratorById,
  getPublicCollaborators,
  validateCollaboratorInput,
  type Collaborator,
  type CollaboratorInput,
} from './talentLogic';

const SAMPLE_ROSTER: Collaborator[] = [
  {
    id: '1',
    nome_completo: 'Elena Rostova',
    cargo: 'Diretora de Operações',
    telefone: '+258 84 120 4401',
    email: 'elena.rostova@meridian.corp',
    ano_contratacao: 2021,
    status: 'Ativo',
  },
  {
    id: '2',
    nome_completo: 'Mateo Silva',
    cargo: 'Consultor Comercial',
    telefone: '+351 912 345 678',
    email: 'mateo.silva@meridian.corp',
    ano_contratacao: 2023,
    status: 'Férias',
  },
  {
    id: '3',
    nome_completo: 'David Kowalski',
    cargo: 'Suporte Técnico',
    telefone: '+55 11 98765 4321',
    email: 'david.kowalski@meridian.corp',
    ano_contratacao: 2020,
    status: 'Rescindido',
  },
];

test('getPublicCollaborators NEVER exposes Rescindido records', () => {
  const visible = getPublicCollaborators(SAMPLE_ROSTER, { query: '', cargo: 'Todos' });
  assert.equal(visible.length, 2);
  assert.equal(visible.some((c) => c.status === 'Rescindido'), false);

  // Even searching directly for the Rescindido person's name returns empty
  const searchRescindido = getPublicCollaborators(SAMPLE_ROSTER, {
    query: 'David Kowalski',
    cargo: 'Todos',
  });
  assert.equal(searchRescindido.length, 0);
});

test('getPublicCollaboratorById returns active/vacation profiles and blocks Rescindido', () => {
  assert.equal(getPublicCollaboratorById(SAMPLE_ROSTER, '1')?.nome_completo, 'Elena Rostova');
  assert.equal(getPublicCollaboratorById(SAMPLE_ROSTER, '2')?.nome_completo, 'Mateo Silva');
  assert.equal(getPublicCollaboratorById(SAMPLE_ROSTER, '3'), null);
  assert.equal(getPublicCollaboratorById(SAMPLE_ROSTER, 'inexistente'), null);
});

test('getDynamicPublicRoles excludes roles belonging only to Rescindido staff', () => {
  const roles = getDynamicPublicRoles(SAMPLE_ROSTER);
  assert.deepEqual(roles, ['Consultor Comercial', 'Diretora de Operações']);
  assert.equal(roles.includes('Suporte Técnico'), false);
});

test('getAdminCollaborators includes Rescindido and filters accurately', () => {
  const all = getAdminCollaborators(SAMPLE_ROSTER, { query: '', status: 'Todos' });
  assert.equal(all.length, 3);

  const rescindedOnly = getAdminCollaborators(SAMPLE_ROSTER, {
    query: '',
    status: 'Rescindido',
  });
  assert.equal(rescindedOnly.length, 1);
  assert.equal(rescindedOnly[0].nome_completo, 'David Kowalski');
});

test('computeWorkforceMetrics returns exact counts for Ativo, Férias, and Rescindido', () => {
  const metrics = computeWorkforceMetrics(SAMPLE_ROSTER);
  assert.deepEqual(metrics, {
    total: 3,
    ativos: 1,
    ferias: 1,
    rescindidos: 1,
  });
});

test('validateCollaboratorInput validates required fields and ano_contratacao between 1980 and currentYear', () => {
  const invalid: CollaboratorInput = {
    nome_completo: 'A',
    cargo: '',
    telefone: '123',
    email: 'invalido',
    ano_contratacao: 1979,
    status: 'Ativo',
    foto_perfil: 'ftp://bad.url',
  };

  const res = validateCollaboratorInput(invalid, 2026);
  assert.equal(res.valid, false);
  assert.ok(res.errors.nome_completo);
  assert.ok(res.errors.cargo);
  assert.ok(res.errors.telefone);
  assert.ok(res.errors.email);
  assert.ok(res.errors.ano_contratacao);
  assert.ok(res.errors.foto_perfil);

  const futureYear = validateCollaboratorInput(
    {
      nome_completo: 'Clara Mendes',
      cargo: 'Gerente',
      telefone: '+258 84 555 0199',
      email: 'clara@meridian.corp',
      ano_contratacao: 2027,
      status: 'Ativo',
    },
    2026,
  );
  assert.equal(futureYear.valid, false);
  assert.ok(futureYear.errors.ano_contratacao);

  const valid = validateCollaboratorInput(
    {
      nome_completo: 'Clara Mendes',
      cargo: 'Gerente',
      telefone: '+258 84 555 0199',
      email: 'clara@meridian.corp',
      ano_contratacao: 2024,
      status: 'Ativo',
    },
    2026,
  );
  assert.equal(valid.valid, true);
});

test('formatting helpers build WhatsApp, tel, mailto, tenure, and initials', () => {
  assert.equal(formatCompanyTenure(2021), 'Na empresa desde 2021');
  assert.equal(getInitials('Elena Rostova'), 'ER');
  assert.equal(buildWhatsAppUrl('+258 84 120 4401'), 'https://wa.me/258841204401');
  assert.equal(buildTelUrl('+258 84 120 4401'), 'tel:+258841204401');
  assert.equal(buildMailtoUrl('elena@meridian.corp'), 'mailto:elena@meridian.corp');
});

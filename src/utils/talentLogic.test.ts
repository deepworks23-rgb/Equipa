import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoUrl,
  buildTelUrl,
  buildVCardContent,
  buildWhatsAppUrl,
  calculateCompanyTenureParts,
  computeDepartmentStatusDistribution,
  computeStatusDistribution,
  computeWorkforceMetrics,
  formatCompanyTenure,
  formatHiringDateLong,
  formatHiringDateShort,
  formatTagList,
  formatTenureDuration,
  getAdminCollaborators,
  getAlternativePublicCollaborators,
  getDynamicPublicRoles,
  getInitials,
  getPublicCollaboratorById,
  getPublicCollaborators,
  parseTagList,
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
    data_contratacao: '2021-03-15',
    status: 'Ativo',
    departamento: 'Comercial',
  },
  {
    id: '2',
    nome_completo: 'Mateo Silva',
    cargo: 'Consultor Comercial',
    telefone: '+351 912 345 678',
    email: 'mateo.silva@meridian.corp',
    ano_contratacao: 2023,
    data_contratacao: '2023-06-10',
    status: 'Férias',
    departamento: 'Comercial',
  },
  {
    id: '3',
    nome_completo: 'David Kowalski',
    cargo: 'Suporte Técnico',
    telefone: '+55 11 98765 4321',
    email: 'david.kowalski@meridian.corp',
    ano_contratacao: 2020,
    data_contratacao: '2020-05-18',
    status: 'Rescindido',
    departamento: 'Comercial',
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

test('getAlternativePublicCollaborators returns only active peers and never Rescindido', () => {
  const alternatives = getAlternativePublicCollaborators(SAMPLE_ROSTER, SAMPLE_ROSTER[1]);
  assert.equal(alternatives.length, 1);
  assert.equal(alternatives[0].id, '1');
  assert.equal(alternatives.some((c) => c.status === 'Rescindido'), false);
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

test('validateCollaboratorInput validates required fields and full hiring date between 1980-01-01 and today', () => {
  const refDate = new Date(2026, 10, 25); // 2026-11-25
  const invalid: CollaboratorInput = {
    nome_completo: 'A',
    cargo: '',
    telefone: '123',
    email: 'invalido',
    ano_contratacao: 1979,
    data_contratacao: '1979-12-31',
    status: 'Ativo',
    foto_perfil: 'ftp://bad.url',
  };

  const res = validateCollaboratorInput(invalid, refDate);
  assert.equal(res.valid, false);
  assert.ok(res.errors.nome_completo);
  assert.ok(res.errors.cargo);
  assert.ok(res.errors.telefone);
  assert.ok(res.errors.email);
  assert.ok(res.errors.data_contratacao);
  assert.ok(res.errors.foto_perfil);

  const futureDate = validateCollaboratorInput(
    {
      nome_completo: 'Clara Mendes',
      cargo: 'Gerente',
      telefone: '+258 84 555 0199',
      email: 'clara@meridian.corp',
      ano_contratacao: 2027,
      data_contratacao: '2026-12-01',
      status: 'Ativo',
    },
    refDate,
  );
  assert.equal(futureDate.valid, false);
  assert.ok(futureDate.errors.data_contratacao);

  const invalidCalendar = validateCollaboratorInput(
    {
      nome_completo: 'Clara Mendes',
      cargo: 'Gerente',
      telefone: '+258 84 555 0199',
      email: 'clara@meridian.corp',
      ano_contratacao: 2024,
      data_contratacao: '2024-02-30',
      status: 'Ativo',
    },
    refDate,
  );
  assert.equal(invalidCalendar.valid, false);
  assert.ok(invalidCalendar.errors.data_contratacao);

  const valid = validateCollaboratorInput(
    {
      nome_completo: 'Clara Mendes',
      cargo: 'Gerente',
      telefone: '+258 84 555 0199',
      email: 'clara@meridian.corp',
      ano_contratacao: 2024,
      data_contratacao: '2024-05-10',
      status: 'Ativo',
    },
    refDate,
  );
  assert.equal(valid.valid, true);
});

test('dynamic tenure helpers calculate exact years, months, and days in Portuguese', () => {
  const refDate = new Date(2026, 10, 25); // 2026-11-25

  assert.equal(formatHiringDateShort('2021-03-15'), '15/03/2021');
  assert.equal(formatHiringDateLong('2021-03-15'), '15 de março de 2021');
  assert.deepEqual(calculateCompanyTenureParts('2021-03-15', refDate), {
    years: 5,
    months: 8,
    days: 10,
  });
  assert.equal(formatCompanyTenure('2021-03-15', refDate), '5 anos e 8 meses na empresa');
  assert.equal(formatCompanyTenure('2025-11-25', refDate), '1 ano na empresa');
  assert.equal(formatCompanyTenure('2026-08-10', refDate), '3 meses na empresa');
  assert.equal(formatCompanyTenure('2026-11-10', refDate), '15 dias na empresa');
  assert.equal(formatCompanyTenure('2026-11-25', refDate), 'Integrado hoje');
  assert.equal(formatTenureDuration('2021-03-15', refDate), '5 anos e 8 meses');
});

test('formatting helpers build WhatsApp, tel, mailto, tags, vCard, and initials', () => {
  assert.equal(getInitials('Elena Rostova'), 'ER');
  assert.equal(buildWhatsAppUrl('+258 84 120 4401'), 'https://wa.me/258841204401');
  assert.equal(buildTelUrl('+258 84 120 4401'), 'tel:+258841204401');
  assert.equal(buildMailtoUrl('elena@meridian.corp'), 'mailto:elena@meridian.corp');
  assert.deepEqual(parseTagList(' Português , Inglês, português , '), ['Português', 'Inglês']);
  assert.equal(formatTagList(['Português', 'Inglês']), 'Português, Inglês');
  const vcard = buildVCardContent(SAMPLE_ROSTER[0]);
  assert.ok(vcard.includes('BEGIN:VCARD'));
  assert.ok(vcard.includes('FN:Elena Rostova'));
  assert.ok(vcard.includes('TEL;TYPE=WORK,VOICE:+258841204401'));
  assert.ok(vcard.includes('END:VCARD'));
});

test('distribution helpers group collaborators by department and status accurately', () => {
  const extended: Collaborator[] = [
    ...SAMPLE_ROSTER,
    {
      id: '4',
      nome_completo: 'Ana Costa',
      cargo: 'Engenheira',
      telefone: '+258 84 000 0000',
      email: 'ana@meridian.corp',
      ano_contratacao: 2024,
      data_contratacao: '2024-01-10',
      status: 'Ativo',
      departamento: '',
    },
  ];

  const byDept = computeDepartmentStatusDistribution(extended);
  assert.deepEqual(byDept, [
    { departamento: 'Comercial', Ativo: 1, Férias: 1, Rescindido: 1, total: 3 },
    { departamento: 'Sem departamento', Ativo: 1, Férias: 0, Rescindido: 0, total: 1 },
  ]);

  const byStatus = computeStatusDistribution(extended);
  assert.deepEqual(byStatus, [
    { status: 'Ativo', count: 2, percentage: 50 },
    { status: 'Férias', count: 1, percentage: 25 },
    { status: 'Rescindido', count: 1, percentage: 25 },
  ]);
});

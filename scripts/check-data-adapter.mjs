import assert from 'node:assert/strict'
import { adaptData, missingTemplatePaths, resolvePath } from '../app/stores/data-source.ts'

// El adaptador es lógica pura: se prueba sin navegador ni base de datos.
const payload = {
  rows: [
    { customer_name: 'Acme', order_number: 'A-1', qty: 2, created: new Date('2026-10-02T10:00:00Z') },
    { customer_name: 'Beta', order_number: 'A-2', qty: 3, created: new Date('2026-10-03T10:00:00Z') },
  ],
  totals: { grand_total: 25 },
}

const map = {
  'company.name': 'rows[0].customer_name',
  'invoice.number': 'rows[1].order_number',
  'invoice.date': 'rows[0].created',
  'table.cols': ['Concepto', 'Cant.'],
  'table.rows': { from: 'rows', select: ['customer_name', 'qty'] },
  total: 'totals.grand_total',
  missing: 'rows[9].nope',
}

const { data, missing } = adaptData(payload, map)
assert.equal(data.company.name, 'Acme')
assert.equal(data.invoice.number, 'A-2')
assert.equal(data.invoice.date, '2026-10-02', 'Date se normaliza a YYYY-MM-DD')
assert.deepEqual(data.table.cols, ['Concepto', 'Cant.'])
assert.deepEqual(data.table.rows, [['Acme', 2], ['Beta', 3]])
assert.equal(data.total, 25)
assert.equal(data.missing, null)
assert.deepEqual(missing, ['rows[9].nope'])

// Mapeo vacío: el payload se usa tal cual.
assert.equal(adaptData(payload, {}).data, payload)
assert.deepEqual(adaptData(payload).missing, [])

// Matriz con origen que no es un array.
const badMatrix = adaptData({ rows: 'nope' }, { 'table.rows': { from: 'rows', select: ['x'] } })
assert.deepEqual(badMatrix.data.table.rows, [])
assert.deepEqual(badMatrix.missing, ['rows'])

// resolvePath
assert.equal(resolvePath({ a: [{ b: 1 }] }, 'a[0].b'), 1)
assert.equal(resolvePath({ a: 1 }, 'a[0]'), undefined)
assert.equal(resolvePath({ a: 1 }, 'a.b'), undefined)

// `__proto__` no contamina Object.prototype.
adaptData({}, { '__proto__.polluted': 'x' })
assert.equal({}.polluted, undefined)

// Rutas que esperan las plantillas.
const roots = [
  { data: { content: 'Hola {{company.name}} {{ total }}' } },
  { data: { content: '{{#each rows}}{{qty}}{{/each}}{{else}}x{{/if}}' } },
]
assert.deepEqual(missingTemplatePaths(roots, data), [])
assert.deepEqual(missingTemplatePaths(roots, {}), ['company.name', 'total'])

console.log('ok: adaptador de datos')

import assert from 'node:assert/strict'
import { patchEachPath, patchTagClass, readEachPath, readTagClass } from '../app/stores/tag-class.ts'

// Helpers puros: los inputs de los ajustes leen y reescriben las clases dentro
// del markup de tabla (`data.columns` / `data.rows`).

const columns = '{{#each table.cols}}\n    <th class="p-4">{{this}}</th>\n  {{/each}}'
const rows =
  '{{#each table.rows}}<tr class="hover:bg-zinc-50"><td class="p-4">{{this}}</td></tr>{{/each}}'

assert.equal(readTagClass(columns, 'th'), 'p-4')
assert.equal(readTagClass(rows, 'tr'), 'hover:bg-zinc-50')
assert.equal(readTagClass(rows, 'td'), 'p-4')
assert.equal(readTagClass(undefined, 'th'), '', 'sin markup devuelve cadena vacía')

assert.equal(patchTagClass(columns, 'th', 'p-4 text-left'), columns.replace('p-4', 'p-4 text-left'))
assert.equal(
  patchTagClass(rows, 'tr', ''),
  '{{#each table.rows}}<tr class=""><td class="p-4">{{this}}</td></tr>{{/each}}',
  'vaciar el input quita las clases',
)

const twoCells = '<tr><td class="p-4">a</td><td class="p-4">b</td></tr>'
assert.equal(
  patchTagClass(twoCells, 'td', 'p-2'),
  '<tr><td class="p-2">a</td><td class="p-2">b</td></tr>',
  'se reemplazan todas las celdas, no solo la primera',
)
assert.equal(
  patchTagClass('<td class="p-4">$&</td>', 'td', '$&'),
  '<td class="$&">$&</td>',
  'una clase con $ no se interpreta como reemplazo',
)
assert.equal(
  patchTagClass('<td class="p-4" data-x="1">a</td>', 'td', 'p-2'),
  '<td class="p-2" data-x="1">a</td>',
  'solo se toca el atributo class',
)

// Rutas del {{#each}}: solo se reescribe el each externo.
assert.equal(readEachPath(columns), 'table.cols')
assert.equal(readEachPath(rows), 'table.rows')
assert.equal(readEachPath('<tr><td>x</td></tr>'), '', 'sin each devuelve cadena vacía')

assert.equal(
  patchEachPath(rows, 'months.rows'),
  '{{#each months.rows}}<tr class="hover:bg-zinc-50"><td class="p-4">{{this}}</td></tr>{{/each}}',
  'la ruta de filas conserva el {{#each this}} interno',
)
assert.equal(
  patchEachPath(columns, 'factura.cols'),
  '{{#each factura.cols}}\n    <th class="p-4">{{this}}</th>\n  {{/each}}',
)
assert.equal(
  patchEachPath(rows, 'x'),
  '{{#each x}}<tr class="hover:bg-zinc-50"><td class="p-4">{{this}}</td></tr>{{/each}}',
  'el {{#each this}} del cuerpo no se reescribe',
)
assert.equal(patchEachPath('<td>x</td>', 'x'), '<td>x</td>', 'markup sin each queda intacto')

// Una ruta mal escrita (con espacios) se puede recuperar desde el input.
const broken = '{{#each p-4 text-left}}<tr><td>{{this}}</td></tr>{{/each}}'
assert.equal(readEachPath(broken), 'p-4 text-left')
assert.equal(
  patchEachPath(broken, 'table.rows'),
  '{{#each table.rows}}<tr><td>{{this}}</td></tr>{{/each}}',
  'reemplaza el each completo aunque la ruta anterior esté mal',
)

console.log('check-table-classes: ok')

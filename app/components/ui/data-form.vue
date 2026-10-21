<template>
  <div class="flex flex-col gap-2.5">
    <p v-if="!entries.length"
      class="rounded-xl border-2 border-dashed border-content/10 bg-surface/50 px-4 py-10 text-center text-sm text-content-muted">
      {{ t("editor.dataForm.empty") }}
    </p>

    <div v-for="entry in entries" :key="entry.key">
      <!-- Escalar: string / number / boolean / null -->
      <div v-if="entry.kind === 'scalar'" class="flex items-start gap-1.5">
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex items-center justify-between gap-2">
            <span class="truncate text-xs font-medium text-content-muted">{{ entry.key }}</span>
            <select :value="fieldTypeOf(entry.value)" :class="TYPE_SELECT_CLASS"
              :aria-label="t('editor.dataForm.typeOf', { key: entry.key })" @change="changeType(entry.key, $event)">
              <option v-for="ft in TYPES" :key="ft" :value="ft">{{ typeLabel(ft) }}</option>
            </select>
          </div>
          <input v-if="typeof entry.value === 'boolean'" type="checkbox"
            class="size-4 shrink-0 cursor-pointer accent-primary" :checked="entry.value === true"
            :aria-label="entry.key" @change="onBoolChange(entry.key, $event)" />
          <textarea v-else-if="isLongText(entry.value)" rows="3" :value="stringValue(entry.value)"
            :class="`${FIELD_CLASS} resize-y`" @input="onTextInput(entry.key, $event)" />
          <input v-else :type="typeof entry.value === 'number' ? 'number' : 'text'" :value="stringValue(entry.value)"
            :class="FIELD_CLASS" @input="onScalarInput(entry.key, $event)" />
        </div>
        <button type="button" :class="[ICON_BTN, 'mt-6']" :title="t('editor.dataForm.deleteField')"
          @click="removeField(entry.key)">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <!-- Objeto: tarjeta plegable con campos anidados (recursivo) -->
      <div v-else-if="entry.kind === 'object'" class="rounded-xl border border-content/10 bg-surface p-3">
        <div class="flex items-center justify-between gap-2">
          <button type="button" class="flex min-w-0 items-center gap-1.5" @click="toggleCollapse(entry.key)">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              class="shrink-0 text-content-muted transition-transform" :class="{ 'rotate-90': !isCollapsed(entry.key) }">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span class="truncate text-xs font-bold text-content">{{ entry.key }}</span>
          </button>
          <div class="flex shrink-0 items-center gap-1.5">
            <select :value="fieldTypeOf(entry.value)" :class="TYPE_SELECT_CLASS"
              :aria-label="t('editor.dataForm.typeOf', { key: entry.key })" @change="changeType(entry.key, $event)">
              <option v-for="ft in TYPES" :key="ft" :value="ft">{{ typeLabel(ft) }}</option>
            </select>
            <button type="button" :class="ICON_BTN" :title="t('editor.dataForm.deleteField')"
              @click="removeField(entry.key)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <div v-show="!isCollapsed(entry.key)" class="mt-3 border-l-2 border-content/10 pl-3">
          <DataForm :obj="entry.value" @change="forward" />
        </div>
      </div>

      <!-- Array: rejilla (matriz u objetos) o lista de primitivos -->
      <div v-else-if="entry.kind === 'array'" class="rounded-xl border border-content/10 bg-surface p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex min-w-0 items-center gap-1.5">
            <span class="truncate text-xs font-bold text-content">{{ entry.key }}</span>
            <span class="rounded-full bg-surface-alt px-1.5 py-0.5 text-[10px] font-semibold text-content-muted">
              {{ entry.value.length }}
            </span>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <select :value="fieldTypeOf(entry.value)" :class="TYPE_SELECT_CLASS"
              :aria-label="t('editor.dataForm.typeOf', { key: entry.key })" @change="changeType(entry.key, $event)">
              <option v-for="ft in TYPES" :key="ft" :value="ft">{{ typeLabel(ft) }}</option>
            </select>
            <button type="button" :class="ADD_ROW_BTN" @click="addRow(entry.key)">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {{ t("editor.dataForm.addRow") }}
            </button>
            <button type="button" :class="ICON_BTN" :title="t('editor.dataForm.deleteField')"
              @click="removeField(entry.key)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-3">
          <!-- Matriz (array de arrays, p. ej. table.rows): una columna por celda -->
          <div v-if="arrayShape(entry.key, entry.value) === 'matrix'" class="overflow-x-auto">
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th v-for="(h, i) in matrixHeaders(entry.key, entry.value)" :key="i"
                    class="border-b border-content/10 px-2 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-content-muted">
                    {{ h }}
                  </th>
                  <th class="w-8 border-b border-content/10" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in entry.value" :key="ri" class="border-b border-content/10 last:border-0">
                  <td v-for="(cell, ci) in row" :key="ci" class="p-1 align-top">
                    <input :type="typeof cell === 'number' ? 'number' : 'text'" :value="cell" :class="CELL_CLASS"
                      @input="onCellInput(entry.key, ri, ci, $event)" />
                  </td>
                  <td class="p-1 text-right align-top">
                    <button type="button" :class="SMALL_ICON_BTN" :title="t('editor.dataForm.deleteRow')"
                      @click="removeRow(entry.key, ri)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Array de objetos: una fila por objeto, columnas = unión de claves -->
          <div v-else-if="arrayShape(entry.key, entry.value) === 'objects'" class="overflow-x-auto">
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th v-for="col in objectColumns(entry.value)" :key="col"
                    class="border-b border-content/10 px-2 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-content-muted">
                    {{ col }}
                  </th>
                  <th class="w-8 border-b border-content/10" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in entry.value" :key="ri" class="border-b border-content/10 last:border-0">
                  <td v-for="col in objectColumns(entry.value)" :key="col" class="p-1 align-top">
                    <input v-if="typeof row[col] === 'boolean'" type="checkbox" class="mt-1 size-4 accent-primary"
                      :checked="row[col] === true" @change="onObjectCellBool(entry.key, ri, col, $event)" />
                    <input v-else :type="typeof row[col] === 'number' ? 'number' : 'text'" :value="row[col] ?? ''"
                      :class="CELL_CLASS" @input="onObjectCellInput(entry.key, ri, col, $event)" />
                  </td>
                  <td class="p-1 text-right align-top">
                    <button type="button" :class="SMALL_ICON_BTN" :title="t('editor.dataForm.deleteRow')"
                      @click="removeRow(entry.key, ri)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Lista de primitivos -->
          <ul v-else class="flex flex-col gap-2">
            <li v-for="(item, i) in entry.value" :key="i" class="flex items-center gap-1.5">
              <input v-if="typeof item === 'boolean'" type="checkbox" class="size-4 shrink-0 accent-primary"
                :checked="item === true" @change="onListItemBool(entry.key, i, $event)" />
              <input v-else :type="typeof item === 'number' ? 'number' : 'text'" :value="item"
                :class="`${CELL_CLASS} flex-1`" @input="onListItemInput(entry.key, i, $event)" />
              <button type="button" :class="SMALL_ICON_BTN" :title="t('editor.dataForm.deleteRow')"
                @click="removeRow(entry.key, i)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Añadir campo nuevo a este objeto (con tipo) -->
    <form class="flex items-center gap-2" @submit.prevent="addField">
      <input v-model="newFieldName" :class="`${FIELD_CLASS} flex-1`" :placeholder="t('editor.dataForm.fieldName')" />
      <select v-model="newFieldType" :class="TYPE_ADD_SELECT_CLASS" :aria-label="t('editor.dataForm.fieldType')">
        <option v-for="ft in TYPES" :key="ft" :value="ft">{{ typeLabel(ft) }}</option>
      </select>
      <button type="submit" :disabled="!newFieldName.trim()"
        class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-content/10 bg-surface px-3 py-2 text-xs font-semibold text-content-muted transition-colors hover:border-content/25 hover:text-content disabled:cursor-not-allowed disabled:opacity-40">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {{ t("editor.dataForm.addField") }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "#imports";
// Auto-import circular (un módulo puede importarse a sí mismo): hace que
// `<DataForm>` se resuelva dentro de este mismo archivo (componente recursivo).
import DataForm from "./data-form.vue";

const props = defineProps<{
  /** Objeto cuyas claves se editan como campos del formulario. */
  obj: Record<string, any>;
}>();

const emit = defineEmits<{
  /** Cualquier mutación: el padre (re)renderiza el preview con debounce. */
  change: [];
}>();

const { t } = useI18n();

const FIELD_CLASS =
  "block w-full rounded-lg border border-content/10 bg-surface px-3 py-2 text-sm text-content transition-colors hover:border-content/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";
const CELL_CLASS =
  "w-full rounded-md border border-content/10 bg-surface px-2 py-1.5 text-xs text-content transition-colors hover:border-content/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";
const ICON_BTN =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-content/40 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50";
const SMALL_ICON_BTN =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-content/40 transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50";
const ADD_ROW_BTN =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
const TYPE_SELECT_CLASS =
  "shrink-0 cursor-pointer rounded-md border border-content/10 bg-surface-alt px-1.5 py-0.5 text-[10px] font-semibold text-content-muted transition-colors hover:border-content/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";
const TYPE_ADD_SELECT_CLASS =
  "shrink-0 cursor-pointer rounded-lg border border-content/10 bg-surface px-2 py-2 text-xs font-semibold text-content-muted transition-colors hover:border-content/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

// ── Tipos de campo ───────────────────────────────────────────────────────────

/** Tipos que el formulario puede mostrar/crear para una clave. */
type FieldType = "texto" | "numero" | "booleano" | "lista" | "objeto" | "tabla";
const TYPES: FieldType[] = ["texto", "numero", "booleano", "lista", "objeto", "tabla"];

function fieldTypeOf(value: any): FieldType {
  if (value === null || value === undefined) return "texto";
  if (typeof value === "boolean") return "booleano";
  if (typeof value === "number") return "numero";
  if (typeof value === "string") return "texto";
  if (Array.isArray(value)) return "lista";
  // Objeto con la forma canónica de tabla de la app (`table.cols` + `table.rows`).
  if (Array.isArray(value.cols) && Array.isArray(value.rows)) return "tabla";
  return "objeto";
}

function typeLabel(type: FieldType) {
  return t(`editor.dataForm.types.${type}`);
}

/** Valor vacío con el que se inicializa un campo al crearlo o cambiarle el tipo. */
function emptyValueOf(type: FieldType): any {
  switch (type) {
    case "numero":
      return 0;
    case "booleano":
      return false;
    case "lista":
      return [];
    case "objeto":
      return {};
    case "tabla":
      return {
        cols: [1, 2, 3].map((i) => `${t("editor.dataForm.column")} ${i}`),
        rows: [["", "", ""]],
      };
    default:
      return "";
  }
}

const newFieldName = ref("");
const newFieldType = ref<FieldType>("texto");
const collapsed = ref<Set<string>>(new Set());

type Entry = { key: string; value: any; kind: "scalar" | "object" | "array" };

const entries = computed<Entry[]>(() => {
  const obj = props.obj;
  if (!obj || typeof obj !== "object") return [];
  return Object.keys(obj).map((key) => {
    const value = obj[key];
    let kind: Entry["kind"] = "scalar";
    if (value !== null && typeof value === "object") {
      kind = Array.isArray(value) ? "array" : "object";
    }
    return { key, value, kind };
  });
});

function forward() {
  emit("change");
}

function isCollapsed(key: string) {
  return collapsed.value.has(key);
}

function toggleCollapse(key: string) {
  const next = new Set(collapsed.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  collapsed.value = next;
}

// ── Escalares ────────────────────────────────────────────────────────────────

function isLongText(value: any) {
  return typeof value === "string" && (value.length > 80 || value.includes("\n"));
}

function stringValue(value: any) {
  return value === null || value === undefined ? "" : String(value);
}

function setField(key: string, value: any) {
  (props.obj as Record<string, any>)[key] = value;
  forward();
}

function onScalarInput(key: string, e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  // Un campo numérico conserva su tipo mientras haya valor; vacío pasa a string.
  const value = typeof props.obj[key] === "number" && raw !== "" ? Number(raw) : raw;
  setField(key, value);
}

function onTextInput(key: string, e: Event) {
  setField(key, (e.target as HTMLTextAreaElement).value);
}

function onBoolChange(key: string, e: Event) {
  setField(key, (e.target as HTMLInputElement).checked);
}

function removeField(key: string) {
  delete (props.obj as Record<string, any>)[key];
  forward();
}

/** Cambia el tipo de un campo, inicializándolo al valor vacío del nuevo tipo. */
function changeType(key: string, e: Event) {
  const type = (e.target as HTMLSelectElement).value as FieldType;
  setField(key, emptyValueOf(type));
}

function addField() {
  const name = newFieldName.value.trim();
  if (!name) return;
  const obj = props.obj as Record<string, any>;
  if (!Object.prototype.hasOwnProperty.call(obj, name)) {
    obj[name] = emptyValueOf(newFieldType.value);
  }
  newFieldName.value = "";
  forward();
}

// ── Arrays ───────────────────────────────────────────────────────────────────

/** `cols` hermano (forma `table.cols` / `table.rows`), si existe y no es el propio array. */
function siblingCols(key: string, arr: any[]): any[] | null {
  const cols = (props.obj as Record<string, any>)?.cols;
  return Array.isArray(cols) && cols !== arr ? cols : null;
}

function arrayShape(key: string, arr: any[]): "matrix" | "objects" | "list" {
  if (arr.length) {
    if (arr.every((v) => Array.isArray(v))) return "matrix";
    if (arr.every((v) => v !== null && typeof v === "object")) return "objects";
    return "list";
  }
  // Array vacío: si tiene `cols` hermano asumimos filas de tabla.
  return siblingCols(key, arr) ? "matrix" : "list";
}

function matrixHeaders(key: string, arr: any[]): string[] {
  const cols = siblingCols(key, arr);
  if (cols && cols.length && cols.every((c) => c === null || typeof c !== "object")) {
    return cols.map((c) => String(c));
  }
  const width = arr.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
  return Array.from({ length: width }, (_, i) => `${t("editor.dataForm.column")} ${i + 1}`);
}

function objectColumns(arr: any[]): string[] {
  const cols: string[] = [];
  for (const row of arr) {
    for (const k of Object.keys(row ?? {})) {
      if (!cols.includes(k)) cols.push(k);
    }
  }
  return cols;
}

function addRow(key: string) {
  const arr = (props.obj as Record<string, any>)[key];
  if (!Array.isArray(arr)) return;
  const shape = arrayShape(key, arr);
  if (shape === "matrix") {
    const width = Math.max(matrixHeaders(key, arr).length, arr[0]?.length ?? 0, 1);
    arr.push(Array.from({ length: width }, () => ""));
  } else if (shape === "objects") {
    const row: Record<string, any> = {};
    for (const col of objectColumns(arr)) row[col] = "";
    arr.push(row);
  } else {
    arr.push("");
  }
  forward();
}

function removeRow(key: string, index: number) {
  const arr = (props.obj as Record<string, any>)[key];
  if (!Array.isArray(arr)) return;
  arr.splice(index, 1);
  forward();
}

function onCellInput(key: string, ri: number, ci: number, e: Event) {
  const arr = (props.obj as Record<string, any>)[key];
  arr[ri][ci] = (e.target as HTMLInputElement).value;
  forward();
}

function onObjectCellInput(key: string, ri: number, col: string, e: Event) {
  const arr = (props.obj as Record<string, any>)[key];
  const raw = (e.target as HTMLInputElement).value;
  arr[ri][col] = typeof arr[ri][col] === "number" && raw !== "" ? Number(raw) : raw;
  forward();
}

function onObjectCellBool(key: string, ri: number, col: string, e: Event) {
  const arr = (props.obj as Record<string, any>)[key];
  arr[ri][col] = (e.target as HTMLInputElement).checked;
  forward();
}

function onListItemInput(key: string, i: number, e: Event) {
  const arr = (props.obj as Record<string, any>)[key];
  const raw = (e.target as HTMLInputElement).value;
  arr[i] = typeof arr[i] === "number" && raw !== "" ? Number(raw) : raw;
  forward();
}

function onListItemBool(key: string, i: number, e: Event) {
  const arr = (props.obj as Record<string, any>)[key];
  arr[i] = (e.target as HTMLInputElement).checked;
  forward();
}
</script>

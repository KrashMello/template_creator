<template>
  <div class="flex h-full flex-col gap-2 px-4 pb-4">
    <div class="flex shrink-0 items-center gap-1">
      <UButton
        v-for="kind in kinds"
        :key="kind"
        size="xs"
        :color="store.dataSource.kind === kind ? 'primary' : 'neutral'"
        :variant="store.dataSource.kind === kind ? 'solid' : 'outline'"
        @click="store.dataSource.kind = kind"
      >
        {{ t(`editor.dataSource.kinds.${kind}`) }}
      </UButton>
      <span v-if="status" class="ml-auto text-xs text-content-muted">{{ status }}</span>
    </div>

    <div
      class="flex max-h-[50%] shrink-0 flex-col gap-2 overflow-y-auto rounded-xl border border-content/10 p-3"
    >
      <template v-if="store.dataSource.kind === 'rest'">
        <div class="grid grid-cols-[1fr_110px] gap-2">
          <UInput v-model="store.dataSource.rest.url" size="sm" :placeholder="t('editor.dataSource.url')" />
          <USelect v-model="store.dataSource.rest.method" :items="methods" size="sm" />
        </div>
        <UTextarea
          v-model="store.dataSecrets.restHeaders"
          :rows="2"
          size="sm"
          class="font-mono"
          :placeholder="t('editor.dataSource.headers')"
        />
        <UInput
          v-model="store.dataSource.rest.path"
          size="sm"
          :placeholder="t('editor.dataSource.path')"
        />
      </template>

      <template v-else>
        <div class="grid grid-cols-[1fr_110px] gap-2">
          <UInput v-model="store.dataSource.sql.host" size="sm" :placeholder="t('editor.dataSource.host')" />
          <UInput v-model="store.dataSource.sql.port" size="sm" :placeholder="t('editor.dataSource.port')" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <UInput
            v-model="store.dataSource.sql.database"
            size="sm"
            :placeholder="t('editor.dataSource.database')"
          />
          <UInput v-model="store.dataSource.sql.user" size="sm" :placeholder="t('editor.dataSource.user')" />
        </div>
        <UInput
          v-model="store.dataSecrets.sqlPassword"
          type="password"
          size="sm"
          :placeholder="t('editor.dataSource.password')"
        />
        <UCheckbox v-model="store.dataSource.sql.ssl" size="sm" :label="t('editor.dataSource.ssl')" />
        <UTextarea
          v-model="store.dataSource.sql.query"
          :rows="4"
          size="sm"
          class="font-mono"
          :placeholder="t('editor.dataSource.query')"
        />
      </template>

      <div class="flex flex-wrap items-center gap-2">
        <UButton icon="i-lucide-play" size="sm" :loading="loading" @click="load">
          {{ t("editor.dataSource.load") }}
        </UButton>
        <UButton v-if="payloadText" size="xs" variant="ghost" @click="showPayload = !showPayload">
          {{ t("editor.dataSource.payload") }}
        </UButton>
        <span v-if="truncated" class="text-xs text-content-muted">
          {{ t("editor.dataSource.truncated", { n: limit }) }}
        </span>
      </div>

      <pre
        v-if="showPayload && payloadText"
        class="max-h-52 overflow-auto rounded-lg bg-surface-alt p-2 text-[11px] leading-snug"
      >{{ payloadText }}</pre>

      <UAlert v-if="error" color="error" variant="soft" :description="error" />

      <ul v-if="warnings.length" class="list-disc pl-5 text-xs text-content-muted">
        <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
      </ul>

      <p class="text-[11px] text-content-muted">{{ t("editor.dataSource.hint") }}</p>
    </div>

    <div class="min-h-0 flex-1">
      <ui-data-editor v-model="store.dataSource.map" :title="''" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "#imports";
import { adaptData, missingTemplatePaths, resolvePath } from "../../stores/data-source";
import { templateStore } from "../../stores/templateStore";

const store = templateStore();
const { t } = useI18n();

const kinds = ["rest", "sql"] as const;
const methods = ["GET", "POST"];
const loading = ref(false);
const error = ref("");
const warnings = ref<string[]>([]);
const payloadText = ref("");
const showPayload = ref(false);
const truncated = ref(false);
const limit = ref(1000);
const status = ref("");

/** `Nombre: valor` por línea. Las cabeceras viven en `dataSecrets` (sin persistir). */
function parseHeaders(text: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const index = line.indexOf(":");
    if (index > 0) headers[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return headers;
}

function errorMessage(e: any) {
  // fetch directo sin CORS falla como TypeError sin detalle.
  if (e instanceof TypeError) return t("editor.dataSource.cors");
  return e?.data?.data?.message || e?.data?.message || e?.message || String(e);
}

async function readRest() {
  const { url, method, path } = store.dataSource.rest;
  if (!url.trim()) throw new Error(t("editor.dataSource.needUrl"));
  const response = await fetch(url.trim(), { method, headers: parseHeaders(store.dataSecrets.restHeaders) });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const body = await response.json();
  if (!path.trim()) return body;
  const value = resolvePath(body, path.trim());
  if (value === undefined) throw new Error(t("editor.dataSource.badPath", { path: path.trim() }));
  return value;
}

async function readSql() {
  const sql = store.dataSource.sql;
  const result = await $fetch<{ rows: unknown[]; truncated: boolean; limit: number }>("/api/data/sql", {
    method: "POST",
    body: { ...sql, port: Number(sql.port), password: store.dataSecrets.sqlPassword, params: [] },
  });
  truncated.value = !!result.truncated;
  limit.value = result.limit ?? 1000;
  return { rows: result.rows };
}

async function load() {
  error.value = "";
  warnings.value = [];
  payloadText.value = "";
  truncated.value = false;
  status.value = "";

  let map: Record<string, unknown> = {};
  const mapText = store.dataSource.map.trim();
  if (mapText) {
    try {
      map = JSON.parse(mapText);
    } catch {
      error.value = t("editor.dataSource.badMap");
      return;
    }
  }

  loading.value = true;
  try {
    const payload = store.dataSource.kind === "rest" ? await readRest() : await readSql();
    payloadText.value = JSON.stringify(payload, null, 2)?.slice(0, 20_000) ?? "";

    const { data, missing } = adaptData(payload, map);
    store.data = data;
    store.renderPreview();

    const rows = Array.isArray((payload as any)?.rows) ? (payload as any).rows.length : null;
    status.value =
      rows == null ? t("editor.dataSource.loaded") : t("editor.dataSource.loadedRows", { n: rows });

    const expected = missingTemplatePaths([store.schema, store.header, store.footer], data);
    warnings.value = [
      ...missing.map((path) => t("editor.dataSource.missingSource", { path })),
      ...expected.map((path) => t("editor.dataSource.missingTemplate", { path })),
    ];
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="col-span-6 gap-2 flex flex-col shadow-lg h-full overflow-auto py-2 px-5 border-1 border-dashed border-slate-100"
    id="dropzone"
  >
    <layout-content-header @select="selectView" @export="generateDocument" />
    <div
      id="preview"
      class="h-full max-h-[84dvh] overflow-y-auto rounded-lg shadow-sm border-2 border-dashed border-slate-100 p-2"
      v-html="previewHtml"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      v-if="selectedView === 1"
      @drop="onDrop"
    ></div>
    <div
      id="schema"
      class="flex-col gap-2 flex border-2 rounded-lg shadow-sm border-dashed border-slate-100 p-2"
      v-if="selectedView === 2"
    >
      <h2 class="text-xl font-bold text-slate-800">Schema</h2>
      <pre
        id="schema-display"
        class="flex-1 max-h-[78dvh] rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs border-2 border-dashed border-slate-200 p-2"
      >
        {{ schemaJson }}
      </pre>
    </div>
    <ui-style-editor v-if="selectedView === 3" />
    <ui-data-editor v-if="selectedView === 4" />
  </div>
</template>
<script setup>
const previewHtml = computed(() => templateStore().previewHtml);
const schemaJson = computed(() => templateStore().schemaJson);
const selectedView = ref(1);
const selectView = (opt) => {
  selectedView.value = opt;
};
const onDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest(".draggable-component");

  if (target) {
    target.classList.add("border-slate-600", "border-solid");
    target.classList.remove("border-dashed", "border-slate-400");
  }
};
const onDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest(".draggable-component");

  if (target) {
    target.classList.remove("border-slate-600", "border-solid");
    target.classList.add("border-dashed", "border-slate-400");
  }
};
const onDrop = templateStore().onDrop;
const generateDocument = templateStore().generateDocument;
</script>

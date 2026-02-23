<template>
  <div class="flex flex-col gap-2 h-full p-2 rounded-lg shadow-sm border-2 border-dashed border-slate-100">
    <h2 class="text-xl font-bold text-slate-800">{{ title }}</h2>
    <div ref="containerRef" class="code-editor-wrapper" :style="{ height: props.height }">
      <div ref="editorRef" class="code-editor-inner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import loader from "@monaco-editor/loader";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    language?: string;
    height?: string;
    readOnly?: boolean;
    title?: string;
  }>(),
  {
    language: "json",
    height: "100%",
    readOnly: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
let monacoEditor: any = null;

onMounted(async () => {
  if (!editorRef.value) return;

  const monaco = await loader.init();

  monacoEditor = monaco.editor.create(editorRef.value, {
    value: props.modelValue ?? "",
    language: props.language,
    theme: "vs-light",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    readOnly: props.readOnly,
    fontSize: 13,
    lineNumbers: props.language === "json" ? "on" : "off",
    wordWrap: "on",
    automaticLayout: true,
    tabSize: 2,
    formatOnType: true,
    folding: true,
    renderLineHighlight: "none",
    scrollbar: {
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6,
    },
    padding: { top: 8, bottom: 8 },
    overviewRulerLanes: 0,
  });

  // Auto-format JSON on first load
  if (props.language === "json") {
    setTimeout(async () => {
      await monacoEditor.getAction("editor.action.formatDocument")?.run();
    }, 100);
  }

  // Emit on change
  monacoEditor.onDidChangeModelContent(() => {
    const val = monacoEditor.getValue();
    emit("update:modelValue", val);
  });

  // TAB key: indent (no focus change)
  monacoEditor.addCommand(
    monaco.KeyCode.Tab,
    () => {
      monacoEditor.trigger("keyboard", "tab", {});
    }
  );
});

// Sync external changes back into editor (only when value truly differs)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!monacoEditor) return;
    const current = monacoEditor.getValue();
    if (current !== newVal) {
      monacoEditor.setValue(newVal ?? "");
    }
  }
);

// Sync language
watch(
  () => props.language,
  (lang) => {
    if (!monacoEditor) return;
    const monaco = (window as any).monaco;
    if (monaco) {
      monaco.editor.setModelLanguage(monacoEditor.getModel(), lang);
    }
  }
);

onBeforeUnmount(() => {
  monacoEditor?.dispose();
});
</script>

<style scoped>
.code-editor-wrapper {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.code-editor-inner {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <component :is="nodeComponent" />
</template>

<script setup lang="ts">
import { computed, h, defineComponent, resolveComponent } from "vue";
import { templateStore, type SchemaNode, createNodeFromTemplate } from "../../stores/templateStore";

const props = defineProps<{ node: SchemaNode }>();
const store = templateStore();

const isSelected = computed(() => store.selectedComponentId === props.node.id);

const placeholderSrc =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWY1ZjkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=";

function selectNode() {
  store.selectComponent(props.node.id);
}

function onDragStart(e: DragEvent) {
  e.dataTransfer!.setData(
    "text/plain",
    JSON.stringify({
      action: "move",
      id: props.node.id,
      tag: props.node.tag,
      data: props.node.data,
      nombre: props.node.tag,
    })
  );
  e.dataTransfer!.effectAllowed = "move";
}

function onDropInside(e: DragEvent) {
  store.onDrop(e, props.node.id, "body");
}

function deleteNode(e: MouseEvent) {
  e.stopPropagation();
  store.deleteNode(props.node.id);
}

// ── Delete button vnode helper ────────────────────────────────────────────
function deleteBtn() {
  return h(
    "button",
    {
      class:
        "absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs z-10 font-bold leading-none",
      onClick: deleteNode,
    },
    "×"
  );
}

// ── Recursive child renderer ──────────────────────────────────────────────
function renderChildren() {
  const LayoutCanvasNode = resolveComponent("LayoutCanvasNode");
  return (props.node.children ?? []).map((child: SchemaNode) =>
    h(LayoutCanvasNode, { key: child.id, node: child })
  );
}

// ── VariableChips renderer ────────────────────────────────────────────────
function variableChips(text: string) {
  const UiVariableChips = resolveComponent("UiVariableChips");
  return h(UiVariableChips, { text });
}

// ── Main computed component ───────────────────────────────────────────────
const nodeComponent = computed(() => {
  const { node } = props;
  const selected = isSelected.value;

  const baseClasses = (extra = "") =>
    [
      "canvas-node group relative transition-all duration-150",
      selected ? "ring-2 ring-blue-400 ring-offset-1" : "",
      extra,
    ]
      .filter(Boolean)
      .join(" ");

  // ── ROW ──────────────────────────────────────────────────────────────
  if (node.tag === "div" && node.role === "row") {
    return defineComponent({
      name: "CanvasRow",
      setup() {
        return () =>
          h(
            "div",
            {
              class: baseClasses(
                `flex flex-row gap-2 min-h-12 w-full p-1 rounded-lg border-2 border-dashed ${selected ? "border-blue-400 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"}`
              ),
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
              onDragover: (e: DragEvent) => e.preventDefault(),
              onDrop: (e: DragEvent) => { e.stopPropagation(); onDropInside(e); },
            },
            [
              ...renderChildren(),
              !node.children?.length
                ? h("div", { class: "flex-1 flex items-center justify-center text-[11px] text-slate-300 pointer-events-none" }, "Drop columns here")
                : null,
              deleteBtn(),
            ]
          );
      },
    });
  }

  // ── COL ──────────────────────────────────────────────────────────────
  if (node.tag === "div" && node.role === "col") {
    return defineComponent({
      name: "CanvasCol",
      setup() {
        return () =>
          h(
            "div",
            {
              class: baseClasses(
                `flex-1 min-h-12 min-w-0 p-1 rounded-lg flex flex-col gap-1 border-2 border-dashed ${selected ? "border-blue-400 bg-blue-50/30" : "border-slate-200 hover:border-blue-200"}`
              ),
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
              onDragover: (e: DragEvent) => e.preventDefault(),
              onDrop: (e: DragEvent) => { e.stopPropagation(); onDropInside(e); },
            },
            [
              ...renderChildren(),
              !node.children?.length
                ? h("div", { class: "flex items-center justify-center text-[11px] text-slate-300 pointer-events-none min-h-10" }, "Drop here")
                : null,
              deleteBtn(),
            ]
          );
      },
    });
  }

  // ── PARAGRAPH ────────────────────────────────────────────────────────
  if (node.tag === "p") {
    return defineComponent({
      name: "CanvasParagraph",
      setup() {
        return () =>
          h(
            "p",
            {
              class: baseClasses(
                `p-3 rounded-lg text-sm leading-relaxed border-2 border-dashed cursor-pointer ${selected ? "border-blue-400 bg-blue-50/20" : "border-slate-200 hover:border-slate-300"} ${node.data.class ?? ""}`
              ),
              draggable: true,
              onDragstart: onDragStart,
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
            },
            [variableChips(node.data.content ?? "Click to edit..."), deleteBtn()]
          );
      },
    });
  }

  // ── TABLE ────────────────────────────────────────────────────────────
  if (node.tag === "table") {
    const cols: string[] = node.data.cols_data ?? store.data?.table?.cols ?? ["Column 1", "Column 2"];
    const rows: any[][] = node.data.rows_data ?? store.data?.table?.rows ?? [];

    return defineComponent({
      name: "CanvasTable",
      setup() {
        return () =>
          h(
            "div",
            {
              class: baseClasses(
                `rounded-lg overflow-hidden border-2 border-dashed cursor-pointer ${selected ? "border-blue-400" : "border-slate-200 hover:border-slate-300"}`
              ),
              draggable: true,
              onDragstart: onDragStart,
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
            },
            [
              h("table", { class: "w-full text-sm text-left" }, [
                h("thead", { class: "bg-slate-800 text-white" }, [
                  h("tr", {}, cols.map((col) => h("th", { class: "px-4 py-3 font-semibold" }, variableChips(col)))),
                ]),
                h("tbody", {}, rows.map((row, ri) =>
                  h("tr", { key: ri, class: "border-b border-slate-100 odd:bg-white even:bg-slate-50/50" },
                    (Array.isArray(row) ? row : []).map((cell, ci) =>
                      h("td", { key: ci, class: "px-4 py-3 text-slate-700" }, variableChips(String(cell ?? "")))
                    )
                  )
                )),
              ]),
              deleteBtn(),
            ]
          );
      },
    });
  }

  // ── IMAGE ────────────────────────────────────────────────────────────
  if (node.tag === "img") {
    return defineComponent({
      name: "CanvasImage",
      setup() {
        return () =>
          h(
            "div",
            {
              class: baseClasses(
                `rounded-lg overflow-hidden border-2 border-dashed cursor-pointer ${selected ? "border-blue-400" : "border-slate-200 hover:border-slate-300"}`
              ),
              draggable: true,
              onDragstart: onDragStart,
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
            },
            [
              h("img", {
                src: node.data.src || placeholderSrc,
                class: node.data.class || "w-full max-h-48 object-cover",
                alt: "",
              }),
              deleteBtn(),
            ]
          );
      },
    });
  }

  // ── DATA FIELD ───────────────────────────────────────────────────────
  if (node.role === "field") {
    return defineComponent({
      name: "CanvasDataField",
      setup() {
        return () =>
          h(
            "div",
            {
              class: baseClasses(
                `p-3 rounded-lg border-2 border-dashed cursor-pointer ${selected ? "border-blue-400 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"}`
              ),
              draggable: true,
              onDragstart: onDragStart,
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
            },
            [
              h("div", { class: "flex items-center gap-2 mb-1" }, [
                h("span", { class: "text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded" }, "FIELD BINDING"),
              ]),
              h("div", { class: "font-mono text-sm text-slate-600" },
                variableChips(node.data.binding ? `{{${node.data.binding}}}` : "(no binding)")
              ),
              deleteBtn(),
            ]
          );
      },
    });
  }

  // ── DIVIDER ──────────────────────────────────────────────────────────
  if (node.tag === "hr") {
    return defineComponent({
      name: "CanvasDivider",
      setup() {
        return () =>
          h(
            "div",
            {
              class: baseClasses(`py-2 cursor-pointer ${selected ? "opacity-100" : "opacity-70 hover:opacity-100"}`),
              onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
            },
            [h("hr", { class: `border-slate-300 ${node.data.class ?? ""}` }), deleteBtn()]
          );
      },
    });
  }

  // ── GENERIC DIV ──────────────────────────────────────────────────────
  return defineComponent({
    name: "CanvasGenericDiv",
    setup() {
      return () =>
        h(
          "div",
          {
            class: baseClasses(
              `p-2 rounded-lg border-2 border-dashed cursor-pointer ${selected ? "border-blue-400 bg-blue-50/20" : "border-slate-200 hover:border-slate-300"} ${node.data.class ?? ""}`
            ),
            draggable: true,
            onDragstart: onDragStart,
            onClick: (e: MouseEvent) => { e.stopPropagation(); selectNode(); },
            onDragover: (e: DragEvent) => e.preventDefault(),
            onDrop: (e: DragEvent) => { e.stopPropagation(); onDropInside(e); },
          },
          [
            ...renderChildren(),
            !node.children?.length
              ? h("div", { class: "text-[11px] text-slate-300 pointer-events-none p-1" }, "Empty")
              : null,
            deleteBtn(),
          ]
        );
    },
  });
});
</script>

<style>
.canvas-node {
  position: relative;
}
</style>

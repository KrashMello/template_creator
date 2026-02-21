import { defineStore } from "pinia";
import { ref, computed } from "vue";
import handlebars from "handlebars";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
export interface SchemaNode {
  id: string;
  tag: string;
  role?: "row" | "col" | "header" | "footer" | "body" | "field" | "divider";
  data: Record<string, any>;
  children?: SchemaNode[];
}

export interface TemplateSchema {
  type: "container";
  header: SchemaNode | null;
  footer: SchemaNode | null;
  children: SchemaNode[]; // body children
}

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
function uid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** Recursivamente extrae claves del objeto de datos en formato "a.b.c" */
function extractKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const k in obj) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (obj[k] !== null && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      keys.push(...extractKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function cloneSchema(schema: TemplateSchema): TemplateSchema {
  return JSON.parse(JSON.stringify(schema));
}

// ────────────────────────────────────────────────
//  Store
// ────────────────────────────────────────────────
export const templateStore = defineStore("template", {
  state: () => ({
    data: {
      report_date: "2025-01-01",
      customer: {
        fullName: "John Doe",
        email: "john@example.com",
      },
      table: {
        cols: ["Service", "Volume", "Revenue"],
        rows: [
          ["Infrastructure Support", "142 Units", "$12,400.00"],
          ["Security Audit", "1 Item", "$2,500.00"],
        ],
      },
    } as Record<string, any>,

    cssCode: "",

    schema: {
      type: "container",
      header: null,
      footer: null,
      children: [],
    } as TemplateSchema,

    /** ID del componente actualmente seleccionado en el canvas */
    selectedComponentId: null as string | null,

    /** Tipo de componente seleccionado para el panel de propiedades */
    selectedComponentType: null as string | null,

    /** Modo activo del canvas: 'design' | 'data' */
    canvasMode: "design" as "design" | "data",

    /** Historial para undo/redo */
    history: [] as string[],
    redoStack: [] as string[],
  }),

  getters: {
    /** Claves del objeto de datos para autocomplete */
    dataKeys(state): string[] {
      return extractKeys(state.data);
    },

    /** Schema JSON formateado para mostrar */
    schemaJson(state): string {
      return JSON.stringify({ style: state.cssCode, schema: state.schema }, null, 2);
    },

    /** Nodo actualmente seleccionado */
    selectedNode(state): SchemaNode | null {
      if (!state.selectedComponentId) return null;
      return findNodeById(state.schema, state.selectedComponentId);
    },
  },

  actions: {
    // ── Historia ──────────────────────────────────────────────────────────
    pushHistory() {
      this.history.push(JSON.stringify(this.schema));
      this.redoStack = [];
      if (this.history.length > 50) this.history.shift();
    },

    undo() {
      if (!this.history.length) return;
      this.redoStack.push(JSON.stringify(this.schema));
      this.schema = JSON.parse(this.history.pop()!);
      if (this.selectedComponentId) {
        const node = findNodeById(this.schema, this.selectedComponentId);
        if (!node) this.clearSelection();
      }
    },

    redo() {
      if (!this.redoStack.length) return;
      this.history.push(JSON.stringify(this.schema));
      this.schema = JSON.parse(this.redoStack.pop()!);
    },

    // ── Selección ─────────────────────────────────────────────────────────
    selectComponent(id: string | null) {
      this.selectedComponentId = id;
      if (id) {
        const node = findNodeById(this.schema, id);
        this.selectedComponentType = node?.tag ?? null;
      } else {
        this.selectedComponentType = null;
      }
    },

    clearSelection() {
      this.selectedComponentId = null;
      this.selectedComponentType = null;
    },

    // ── Mutaciones CRUD ───────────────────────────────────────────────────
    addToRoot(node: SchemaNode) {
      this.pushHistory();
      this.schema.children.push(node);
    },

    addToNode(parentId: string, node: SchemaNode) {
      this.pushHistory();
      const parent = findNodeById(this.schema, parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    },

    moveNode(nodeId: string, targetId: string | null, position: "before" | "after" | "inside") {
      this.pushHistory();

      // Extraer el nodo a mover
      const node = findNodeById(this.schema, nodeId);
      if (!node) return;
      const nodeClone = JSON.parse(JSON.stringify(node));

      // Eliminar de su posición original
      removeNodeById(this.schema, nodeId);

      if (!targetId || position === "inside") {
        // Si no hay target, agregar al root body
        if (!targetId) {
          this.schema.children.push(nodeClone);
          return;
        }
        // Si es "inside", agregar como hijo del target
        const target = findNodeById(this.schema, targetId);
        if (target) {
          if (!target.children) target.children = [];
          target.children.push(nodeClone);
        }
      } else {
        // before/after respect parent position
        insertNodeRelativeTo(this.schema, nodeClone, targetId, position);
      }
    },

    updateNodeData(nodeId: string, newData: Record<string, any>) {
      this.pushHistory();
      const node = findNodeById(this.schema, nodeId);
      if (node) {
        node.data = { ...node.data, ...newData };
      }
    },

    deleteNode(nodeId: string) {
      this.pushHistory();
      removeNodeById(this.schema, nodeId);
      if (this.selectedComponentId === nodeId) {
        this.clearSelection();
      }
    },

    setHeader(node: SchemaNode | null) {
      this.pushHistory();
      this.schema.header = node;
    },

    setFooter(node: SchemaNode | null) {
      this.pushHistory();
      this.schema.footer = node;
    },

    // ── Drop handler principal ────────────────────────────────────────────
    onDrop(event: DragEvent, targetId: string | null = null, zone: "header" | "footer" | "body" = "body") {
      event.preventDefault();
      event.stopPropagation();

      let transferData: any;
      try {
        transferData = JSON.parse(event.dataTransfer!.getData("text/plain"));
      } catch {
        return;
      }

      const { action, id: sourceId, tag, data, nombre } = transferData;

      if (action === "move") {
        // Mover elemento existente
        if (sourceId === targetId) return;

        const sourceNode = findNodeById(this.schema, sourceId);
        if (!sourceNode) return;

        if (targetId) {
          const targetNode = findNodeById(this.schema, targetId);
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          const relY = event.clientY - rect.top;

          if (targetNode?.role === "col" || targetNode?.role === "row") {
            this.moveNode(sourceId, targetId, "inside");
          } else {
            const pos = relY > rect.height / 2 ? "after" : "before";
            this.moveNode(sourceId, targetId, pos);
          }
        } else {
          this.moveNode(sourceId, null, "inside");
        }
        return;
      }

      // Crear nuevo elemento
      const newNode = createNodeFromTemplate({ tag, data, nombre });

      if (zone === "header") {
        this.setHeader(newNode);
        return;
      }
      if (zone === "footer") {
        this.setFooter(newNode);
        return;
      }

      if (targetId) {
        const targetNode = findNodeById(this.schema, targetId);
        if (targetNode?.role === "col" || targetNode?.role === "row" || targetNode?.tag === "div") {
          this.addToNode(targetId, newNode);
        } else {
          // Insert after target
          this.pushHistory();
          insertNodeRelativeTo(this.schema, newNode, targetId, "after");
        }
      } else {
        this.addToRoot(newNode);
      }
    },

    // ── PDF Export ────────────────────────────────────────────────────────
    async generateDocument() {
      const html = this.generateLayoutHtml(true);
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: handlebars.compile(html)(this.data) }),
      });
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    },

    generateLayoutHtml(pdf = false): string {
      const bodyHtml = this.schema.children
        .map((n) => generateElementHtml(n, pdf))
        .join("");
      const headerHtml = this.schema.header
        ? generateElementHtml(this.schema.header, pdf)
        : "";
      const footerHtml = this.schema.footer
        ? generateElementHtml(this.schema.footer, pdf)
        : "";

      return `<html><head><style>${this.cssCode}</style>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"><\/script>
</head><body>
${headerHtml}
<div class="body-zone">${bodyHtml}</div>
${footerHtml}
</body></html>`;
    },
  },

  persist: {
    pick: ["cssCode", "schema", "data"],
  },
});

// ────────────────────────────────────────────────
//  Tree utilities (module-level, not in store)
// ────────────────────────────────────────────────

export function findNodeById(root: TemplateSchema | SchemaNode, id: string): SchemaNode | null {
  // Handle TemplateSchema root
  const s = root as TemplateSchema;
  if (s.type === "container") {
    if (s.header) {
      if (s.header.id === id) return s.header;
      const found = findInNode(s.header, id);
      if (found) return found;
    }
    if (s.footer) {
      if (s.footer.id === id) return s.footer;
      const found = findInNode(s.footer, id);
      if (found) return found;
    }
    for (const child of s.children) {
      if (child.id === id) return child;
      const found = findInNode(child, id);
      if (found) return found;
    }
    return null;
  }
  // Handle SchemaNode
  return findInNode(root as SchemaNode, id);
}

function findInNode(node: SchemaNode, id: string): SchemaNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findInNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function removeNodeById(root: TemplateSchema, id: string): boolean {
  if (root.header?.id === id) { root.header = null; return true; }
  if (root.footer?.id === id) { root.footer = null; return true; }
  return removeFromChildren(root.children, id);
}

function removeFromChildren(children: SchemaNode[], id: string): boolean {
  const idx = children.findIndex((c) => c.id === id);
  if (idx !== -1) {
    children.splice(idx, 1);
    return true;
  }
  for (const child of children) {
    if (child.children && removeFromChildren(child.children, id)) return true;
  }
  return false;
}

function insertNodeRelativeTo(
  root: TemplateSchema,
  newNode: SchemaNode,
  targetId: string,
  position: "before" | "after"
): boolean {
  return insertInChildren(root.children, newNode, targetId, position);
}

function insertInChildren(
  children: SchemaNode[],
  newNode: SchemaNode,
  targetId: string,
  position: "before" | "after"
): boolean {
  const idx = children.findIndex((c) => c.id === targetId);
  if (idx !== -1) {
    const insertAt = position === "after" ? idx + 1 : idx;
    children.splice(insertAt, 0, newNode);
    return true;
  }
  for (const child of children) {
    if (child.children && insertInChildren(child.children, newNode, targetId, position)) return true;
  }
  return false;
}

export function createNodeFromTemplate(template: { tag: string; data: any; nombre?: string }): SchemaNode {
  const { tag, data } = template;

  // Columnas: crear row con 2 cols internas
  if (tag === "columns") {
    const colCount = data?.cols ?? 2;
    const cols: SchemaNode[] = Array.from({ length: colCount }, () => ({
      id: uid(),
      tag: "div",
      role: "col" as const,
      data: { class: "flex-1 min-h-16 min-w-0" },
      children: [],
    }));
    return {
      id: uid(),
      tag: "div",
      role: "row" as const,
      data: { class: "flex flex-row gap-4 w-full", cols: colCount },
      children: cols,
    };
  }

  // Header fijo
  if (tag === "page-header") {
    return {
      id: uid(),
      tag: "div",
      role: "header" as const,
      data: { class: "flex items-center gap-4 p-4 border-b border-slate-200", content: "Enterprise Report Header" },
      children: [],
    };
  }

  // Footer fijo
  if (tag === "page-footer") {
    return {
      id: uid(),
      tag: "div",
      role: "footer" as const,
      data: { class: "flex items-center justify-between p-4 border-t border-slate-200", content: "Page Footer" },
      children: [],
    };
  }

  // Data Field
  if (tag === "data-field") {
    return {
      id: uid(),
      tag: "div",
      role: "field" as const,
      data: { binding: "", format: "default", class: "" },
      children: [],
    };
  }

  // Divisor
  if (tag === "hr") {
    return {
      id: uid(),
      tag: "hr",
      role: "divider" as const,
      data: { class: "border-slate-200 my-2" },
      children: [],
    };
  }

  return {
    id: uid(),
    tag,
    data: { ...data },
    children: tag === "div" ? [] : undefined,
  };
}

// ────────────────────────────────────────────────
//  HTML generation (for PDF export only)
// ────────────────────────────────────────────────
function generateElementHtml(node: SchemaNode, pdf = false): string {
  const { tag, data, children, role } = node;

  if (tag === "hr") return `<hr class="${data.class ?? ""}" />`;
  if (tag === "img") return `<img src="${data.src ?? ""}" class="${data.class ?? ""}" alt="" />`;

  if (tag === "p") {
    return `<p class="${data.class ?? ""}">${data.content ?? ""}</p>`;
  }

  if (tag === "table") {
    const thead = `<thead><tr>${data.columns ?? ""}</tr></thead>`;
    const tbody = `<tbody>${data.rows ?? ""}</tbody>`;
    return `<table class="${data.class ?? ""}">${thead}${tbody}</table>`;
  }

  if (tag === "div") {
    const inner = (children ?? []).map((c) => generateElementHtml(c, pdf)).join("");
    return `<div class="${data.class ?? ""}">${data.content ?? ""}${inner}</div>`;
  }

  return "";
}

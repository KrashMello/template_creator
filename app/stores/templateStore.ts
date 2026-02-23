import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import handlebars from "handlebars";
import { generateLayoutHtml, insertNodeRelativeTo } from "./template";
import type { ElementDataSet } from "./template";
// para globalizar el estilado del css de los componentes
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
export const templateStore = defineStore("template", {
  state: () => ({
    styleEl: null,
    data: {
      name: "krashmello",
      create_date: '02-02-2026',
      table: {
        cols: ["Service", "Volume", "Revenue"],
        rows: [
          ["Infrastructure Support", "142 Units", "$12,400.00"],
          ["Security Audit", "1 Item", "$2,500.00"],
          ["Networking", "10 Units", "$10,000.00"],
        ],
      }
    },
    selectedElement: null,
    selectedNode: null,
    cssCode: "",
    schema: {
      type: "container",
      children: [],
    },
    schemaJson: "",
    previewHtml: "",
    position: "before",
    options: {
      class: "",
      content: "",
      columns: "",
      rows: "",
      src: "",
    },
    history: [] as string[],
    redoStack: [] as string[],
  }),
  getters: {
    dataKeys(state): string[] {
      return extractKeys(state.data);
    },
  },
  actions: {
    pushHistory() {
      this.history.push(JSON.stringify(this.schema));
      this.redoStack = [];
      if (this.history.length > 50) this.history.shift();
    },
    undo() {
      if (!this.history.length) return;
      this.redoStack.push(this.history.pop()!);
      this.schema = JSON.parse(this.history[this.history.length - 1]);
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    redo() {
      if (!this.redoStack.length) return;
      this.history.push(this.redoStack.pop()!);
      this.schema = JSON.parse(this.history[this.history.length - 1]);
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    renderPreview() {
      try {
        let html = generateLayoutHtml({ schema: this.schema as ElementDataSet, cssCode: this.cssCode });
        html = handlebars.compile(html)(this.data);
        this.previewHtml = html;

        nextTick(() => {
          document
            .querySelectorAll("#preview .draggable-component")
            .forEach((el) => {
              el.draggable = true;
              el.addEventListener("dragstart", this.handlePreviewDragStart);
              el.addEventListener("dragend", this.handlePreviewDragEnd);
              el.addEventListener("dragenter", this.onDragEnter);
              el.addEventListener("dragleave", this.onDragLeave);
              el.addEventListener("dragover", this.onDragOver);
            });
        });
      } catch (e) {
        console.error("Error renderizando preview:", e);
      }
    },
    updateSchemaDisplay() {
      this.schemaJson = JSON.stringify(
        { style: this.cssCode, schema: this.schema },
        null,
        2,
      ).trim();
    },
    async generateDocument() {
      const html = generateLayoutHtml({ schema: this.schema as ElementDataSet, cssCode: this.cssCode, pdf: true })
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: handlebars.compile(html)(this.data),
        }),
      });
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    },
    deleteElement() {
      if (!this.selectedElement) return;
      const path = this.findPathById(
        this.schema,
        this.selectedElement.id,
      );
      this.removeElementAtPath(this.schema, path);
      this.selectedElement = null;
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    deleteElementById(element) {
      const path = this.findPathById(
        this.schema,
        element.id,
      );
      this.removeElementAtPath(this.schema, path);
      this.selectedElement = null;
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    getElementByPath(path) {
      let current = this.schema;
      for (let index of path) {
        current = current.children[index];
      }
      return current;
    },
    findPathById(current, id) {
      const root = current;
      if (root.id === id) return [];
      if (root.children) {
        for (let i = 0; i < root.children.length; i++) {
          const child = root.children[i];
          const path = this.findPathById(child, id);
          if (path !== null) {
            return [i, ...path];
          }
        }
      }
      return null;
    },
    findDataById(current, id) {
      const root = current;
      if (root.id === id) return root;
      if (!root.children) return null;
      for (const child of root.children) {
        const result = this.findDataById(child, id);
        if (result !== null) return result;
      }
      return null;
    },
    insertElementAtPath(root, element, path, index) {
      let parent = root;
      for (let i = 0; i < path.length; i++) {
        parent = parent.children[path[i]];
      }
      if (!parent.children) parent.children = [];
      parent.children.splice(index, 0, element);
    },
    removeElementAtPath(root, path) {
      if (!path || path.length === 0) return;
      let parent = root;
      for (let i = 0; i < path.length - 1; i++) {
        parent = parent.children[path[i]];
      }
      const lastIndex = path[path.length - 1];
      parent.children.splice(lastIndex, 1);
    },
    setStyleEl(el) {
      this.styleEl = el;
    },
    setStyleElTexContent(css) {
      if (this.styleEl) this.styleEl.textContent = css;
    },
    onDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      const dropTarget = event.target.closest(".draggable-component");
      if (dropTarget) {
        dropTarget.classList.remove(
          "border-black",
          "border-solid",
        );
        dropTarget.classList.add("border-dashed", "border-black/50");
      }

      let transferData;
      try {
        transferData = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch (e) {
        return;
      }

      let action = transferData.action || null;
      let id = transferData.id || null;
      let schemaData = transferData.schemaData || transferData;

      if (action === "move" && dropTarget && dropTarget.id === id) {
        return;
      }

      let nuevoElemento;
      if (action === null) {
        nuevoElemento = {
          id: crypto.randomUUID().split("-").join(""),
          tag: schemaData.tag,
          name: schemaData.nombre,
          data: { ...schemaData.data },
          children: [],
        };
      } else {
        nuevoElemento = schemaData;
      }

      const sourcePath = this.findPathById(this.schema, id);
      if (dropTarget) {
        const targetId = dropTarget.id;
        const targetPath = this.findPathById(this.schema, targetId);
        const targetSchema = this.getElementByPath(targetPath);
        console.log(targetId)
        if (targetSchema?.tag === "div") {
          if (!targetSchema.children) targetSchema.children = [];
          insertNodeRelativeTo(this.schema, nuevoElemento, targetId, this.position);
          if (sourcePath) this.removeElementAtPath(this.schema, sourcePath);
        }

      } else {
        this.schema.children.push(nuevoElemento);
        if (sourcePath) this.removeElementAtPath(this.schema, sourcePath);
      }
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    handlePreviewDragStart(event) {
      const element = event.target.closest(".draggable-component");
      const schemaData = this.findDataById(this.schema, element.id);
      const id = element.id;
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          action: "move",
          id,
          schemaData,
        }),
      );
    },
    handlePreviewDragEnd(event) {
      this.renderPreview();
    },
    onDragEnter(event) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target.closest(".draggable-component");

      if (target) {
        target.classList.add("border-black", "border-solid");
        target.classList.remove("border-dashed", "border-black/50");
      }
    },
    onDragLeave(event) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target.closest(".draggable-component");

      if (target) {
        target.classList.remove("border-black", "border-solid");
        target.classList.add("border-dashed", "border-black/50");
      }
    },
    onDragOver(e: DragEvent) {
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      this.position = (e.clientY - rect.top) < rect.height / 2 ? "before" : "after";
    },
    replace(root, element) {
      if (!root.children) return;
      return root.children.map((v) => {
        if (v.id !== element.id) {
          v.children = this.replace(v, element);
          return v;
        } else {
          return element;
        }
      });
    },
    updateElementAtPath(element) {
      this.schema.children = this.replace(this.schema, element);
    },
    clearSelectedElemen() {
      this.selectedElement.classList.remove("border-black", 'border-solid');
      this.selectedElement.classList.add("border-black/50", "border-dashed");
      this.selectedElement = null;
      this.selectedNode = null;
    },
    selectedElementClick(event) {
      event.preventDefault();
      event.stopPropagation();
      const component = event.target.closest(".draggable-component");

      if (!component) return;
      if (this.selectedElement) {
        this.selectedElement.classList.remove("border-black", "border-solid");
        this.selectedElement.classList.add("border-black/50", "border-dashed");
      }
      this.selectedElement = component;
      this.selectedElement.classList.add("border-black", 'border-solid');
      this.selectedElement.classList.remove("border-black/50", "border-dashed");
      this.selectedNode = this.findDataById(this.schema, this.selectedElement.id);

      this.options.class = this.selectedNode.data.class || "";
      this.options.content = this.selectedNode.data.content || "";
      this.options.columns = this.selectedNode.data.columns;
      this.options.rows = this.selectedNode.data.rows;
      this.options.src = this.selectedNode.data.src;
    },
    async saveDataOptions() {
      if (!this.selectedElement) return;

      const element_schema = this.selectedNode
      let data = {
        ...element_schema.data,
      };

      if (this.options.class) {
        data.class = this.options.class;
      }
      if (this.options.columns) {
        data.columns = this.options.columns;
      }
      if (this.options.rows) {
        data.rows = this.options.rows;
      }
      if (this.options.content) {
        data.content = this.options.content;
      }
      if (this.options.src) {
        try {
          if (this.options.src.type.includes("image")) {
            data.src = await fileToBase64(this.options.src);
          }
        } catch (e) { }
      }
      const dataTransfer = {
        ...element_schema,
        data,
      };
      this.selectedNode = dataTransfer;
      this.updateElementAtPath(dataTransfer);
      // this.selectedElement = null;
      this.renderPreview();
      this.updateSchemaDisplay();
    },
  },
  persist: {
    pick: ["styleEl", "cssCode", "schema", "data", "history", "redoStack"],
  },
});

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result?.toString() || "";
      resolve(result);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
};

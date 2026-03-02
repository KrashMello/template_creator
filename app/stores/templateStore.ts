import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import handlebars from "handlebars";
import { findDataById, findIndexElement, findPathById, generateLayoutHtml, getElementByPath, insertElementAtPath, insertNodeRelativeTo, removeElementAtPath, replace, sleep } from "./template";
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
    position: -1,
    selectedElement: null,
    selectedNode: null,
    cssCode: "",
    schema: {
      type: "container",
      children: [],
    },
    schemaJson: "",
    previewHtml: "",
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
              el.addEventListener("click", (e) => {
                this.selectedElementClick(e)
              })
            });
          document.querySelectorAll('[data-function="delete"]').forEach((el) => {
            el.addEventListener('click', (e) => {
              e.stopPropagation()
              const id = el.dataset.id
              this.deleteElementById(id)
            })
          })
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
      const path = findPathById(
        {
          root: this.schema,
          id: this.selectedElement.id,
        }
      );
      removeElementAtPath({ root: this.schema, path });
      this.selectedElement = null;
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    deleteElementById(id: string) {
      const path = findPathById(
        {
          root: this.schema,
          id,
        }
      );
      removeElementAtPath({ root: this.schema, path });
      this.selectedElement = null;
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    setStyleEl(el) {
      this.styleEl = el;
    },
    setStyleElTexContent(css) {
      if (this.styleEl) this.styleEl.textContent = css;
    },
    onDragOver(event) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target.closest(".draggable-component");
      if (!target) return;
      const targetNode = findDataById({ root: this.schema, id: target.id });
      if (!targetNode) return;

      const rect = target.getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      const height = rect.height;
      target.classList.remove("border-dashed", "border-black/50");

      let insertType = 'after';
      if (targetNode.tag === 'div') {
        const threshold = Math.min(height * 0.25, 15); // 15px threshold

        if (relativeY < threshold) {
          insertType = 'before';
        } else if (relativeY > height - threshold) {
          insertType = 'after';
        } else {
          insertType = 'inside';
        }
      } else {
        // Non-container: only Before/After
        insertType = relativeY < height / 2 ? 'before' : 'after';
        const isTop = relativeY < rect.height / 2;
        this.position = findIndexElement({ root: this.schema.children, id: target.id, position: isTop ? 'before' : 'after' })
      }
      if (insertType === 'before') {
        target.classList.add("border-t-4", "border-black");
      } else if (insertType === 'after') {
        target.classList.add("border-b-4", "border-black");
      } else {
        // Inside
        target.classList.add("border-2", "border-black", "border-solid");
      }
    },
    async onDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      let transferData;
      try {
        transferData = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch (e) {
        return;
      }
      let action = transferData.action || null;
      let id = transferData.id || null;
      let schemaData = transferData.schemaData || transferData;

      let dropTarget = null;
      if (event.target.closest(".draggable-component").parentElement.parentElement.id != "preview" && event.target.closest(".draggable-component").parentElement.parentElement != null)
        dropTarget = event.target.closest(".draggable-component").parentElement.parentElement;
      else
        dropTarget = event.target.closest(".draggable-component");
      if (dropTarget) {
        dropTarget.classList.remove(
          "border-black",
          "border-solid",
          "border-t-4",
          "border-b-4",
        );
        dropTarget.classList.add("border-dashed", "border-black/50");
      }
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

      const sourcePath = findPathById({ root: this.schema, id });
      if (sourcePath) removeElementAtPath({ root: this.schema, path: sourcePath });
      if (dropTarget) {
        const targetId = dropTarget.id;
        const targetPath = findPathById({ root: this.schema, id: targetId });
        const targetNode = getElementByPath({ root: this.schema, path: targetPath });
        const rect = dropTarget.getBoundingClientRect();
        const relativeY = event.clientY - rect.top;
        const height = rect.height;
        let insertType = 'after';
        if (targetNode?.tag === "div") {
          const threshold = Math.min(height * 0.25, 15);
          if (relativeY < threshold) insertType = 'before';
          else if (relativeY > height - threshold) insertType = 'after';
          else insertType = 'inside';
        } else {
          insertType = relativeY < height / 2 ? 'before' : 'after';
        }
        if (insertType === 'inside') {
          targetNode.children.push(nuevoElemento);
        } else {
          insertElementAtPath({ root: this.schema, element: nuevoElemento, path: targetPath, index: this.position });
        }
      } else {
        this.schema.children.push(nuevoElemento);
      }
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    handlePreviewDragStart(event) {
      const element = event.target.closest(".draggable-component");
      const schemaData = findDataById({ root: this.schema, id: element.id });
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
        // target.classList.add("border-black", "border-solid");
        target.classList.remove("border-dashed", "border-black/50");
      }
    },
    onDragLeave(event) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target.closest(".draggable-component");

      if (target) {
        target.classList.remove(
          "border-black",
          "border-solid",
          "border-t-4",
          "border-b-4",
          "border-blue-500"
        );
        target.classList.add("border-dashed", "border-black/50");
      }
    },
    updateElementAtPath(element: ElementDataSet) {
      this.schema.children = replace({ root: this.schema, element });
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
      this.selectedNode = findDataById({ root: this.schema, id: this.selectedElement.id });

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

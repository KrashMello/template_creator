import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import handlebars from "handlebars";

// para globalizar el estilado del css de los componentes
const GLOBAL_COMPONENT_STYLE =
  "draggable-component p-3 border-2 border-dashed border-black/50 bg-background rounded-xl " +
  "hover:bg-accent/50 transition-all duration-200 " +
  "cursor-grab active:cursor-grabbing select-none " +
  "flex flex-col gap-1.5 min-h-12 w-full"
  ;
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
        let html = this.generateLayoutHtml(this.schema);
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
            });
        });
      } catch (e) {
        console.error("Error renderizando preview:", e);
      }
    },
    generateLayoutHtml(schema, pdf = false) {
      if (!schema.children || schema.children.length === 0) return `<div class="flex flex-1 gap-3 flex-col justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="text-slate-400"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg><span class="text-sm text-slate-400">drag a component and drop it to the canvas</span></div>`;
      const html = `
<html>
<head>
<style>
${this.cssCode}
</style>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body>
<div class="flex-1 flex flex-col gap-2 pb-2">
${schema.children.map((child) => this.generateElementHtml(child, pdf)).join("")}
</div>
</body>
</html>
`;
      return html;
    },
    updateSchemaDisplay() {
      this.schemaJson = JSON.stringify(
        { style: this.cssCode, schema: this.schema },
        null,
        2,
      ).trim();
    },
    generateElementHtml(elementDataSet, pdf = false) {
      let html = "";
      const divDraggable = `<div 
      id="${elementDataSet.id}"
      class="${!pdf ? GLOBAL_COMPONENT_STYLE : ""}"
      draggable="true"
      onclick="event.stopImmediatePropagation(); selectedElement(event)">
      <div class="flex group items-center font-bold text-sm gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="size-3"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg>
        <span class="flex-1">${elementDataSet.name ?? elementDataSet.tag}</span>
        <button class="hidden group-hover:flex items-center justify-center size-5 rounded-sm bg-red-100 text-red-500 text-sm font-bold leading-none border-none cursor-pointer [transition:all_0.15s]" onclick="event.stopImmediatePropagation(); deleteElementById(${elementDataSet.id})">×</button>
      </div>`;
      html += !pdf ? divDraggable : ""
      let elements = {
        img: () => {
          html += `
        <${elementDataSet.tag}
          src='${elementDataSet.data.src}'
          class=" ${elementDataSet.data.class}"
      />
      `;
        },
        div: () => {
          html += `<${elementDataSet.tag}
          class="${elementDataSet.data.class}"
          id="${elementDataSet.id}"
        >`;
          if (elementDataSet.children && elementDataSet.children.length > 0) {
            html += elementDataSet.children
              .map((child) => this.generateElementHtml(child, pdf))
              .join("");
          }
          html += `</${elementDataSet.tag}>`;
        },
        table: () => {
          html += `
          <${elementDataSet.tag}
            id="${elementDataSet.id}"
            class=" ${elementDataSet.data.class}"
            >`;
          if (elementDataSet.data.table) {
            html += `<thead class="dark:bg-zinc-50 bg-zinc-900 border-b dark:border-zinc-200 border-zinc-800">
              <tr class="dark:text-zinc-500 font-medium text-zinc-400">
              ${elementDataSet.data.columns ? elementDataSet.data.columns : ""}
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
              ${elementDataSet.data.rows ? elementDataSet.data.rows : ""}
        </tbody>`;
          }
          html += `</${elementDataSet.tag}>`;
        },
        p: () => {
          html += `
          <${elementDataSet.tag}
            id="${elementDataSet.id}"
            class="${elementDataSet.data.class}"
          >`;
          if (elementDataSet.data.content) {
            html += elementDataSet.data.content;
          }
          html += `</${elementDataSet.tag}>`;
        },
      };
      elements[elementDataSet.tag]();
      html += !pdf ? "</div>" : ""
      return html;
    },
    async generateDocument() {
      const html = this.generateLayoutHtml(this.schema, true)
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
        const rect = dropTarget.getBoundingClientRect();
        const relativeY = event.clientY - rect.top;
        const isAfter = relativeY > rect.height / 2;

        if (targetSchema?.tag === "div") {
          if (!targetSchema.children) targetSchema.children = [];
          targetSchema.children.push(nuevoElemento);
          if (sourcePath) this.removeElementAtPath(this.schema, sourcePath);
        } else {
          const parentPath = targetPath.slice(0, -1);
          const indexInParent = targetPath[targetPath.length - 1];
          const finalIndex = isAfter ? indexInParent + 1 : indexInParent;
          this.insertElementAtPath(nuevoElemento, parentPath, finalIndex);
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
      this.selectedElement.classList.remove("border-black", 'border-solid');
      this.selectedElement.classList.add("border-black/50", "border-dashed");
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

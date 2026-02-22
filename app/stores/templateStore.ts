import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import handlebars from "handlebars";

// para globalizar el estilado del css de los componentes
const GLOBAL_COMPONENT_STYLE =
  "draggable-component p-3 border-3 border-dashed border-black/50 bg-background rounded-xl " +
  "hover:bg-accent/50 transition-all duration-200 " +
  "cursor-grab active:cursor-grabbing select-none";

export const templateStore = defineStore("template", {
  state: () => ({
    styleEl: null,
    data: {
      table: {
        cols: ["Col 1", "Col 2", "Col 3", "Col 4"],
        rows: [
          ["Row 1", "Row 2", "Row 3", "Row 4"],
          ["Row 1", "Row 2", "Row 3", "Row 4"],
          ["Row 1", "Row 2", "Row 3", "Row 4"],
        ],
      }
    },
    selectedElement: null,
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
  }),
  getters: {},
  actions: {
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
      if (!schema.children || schema.children.length === 0) return "";
      const html = `
<html>
<head>
<style>
${this.cssCode}
</style>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body>
${schema.children.map((child) => this.generateElementHtml(child, pdf)).join("")}
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
      class="draggable-component p-2 border-2 border-dashed border-slate-400 rounded-lg cursor-grab active:cursor-grabbing bg-slate-50"
      draggable="true"
      onclick="selectedElement(event)">`;

      let elements = {
        img: () => {
          html = `
        <${elementDataSet.tag}
          id="${elementDataSet.id}"
          src='${elementDataSet.data.src}'
          class="${!pdf ? GLOBAL_COMPONENT_STYLE : ""} ${elementDataSet.data.class}"
          draggable="true"
          onclick="selectedElement(event)"
      />
      `;
        },
        div: () => {
          html = `<${elementDataSet.tag}
          class="${!pdf ? GLOBAL_COMPONENT_STYLE : ""} ${elementDataSet.data.class}"
          id="${elementDataSet.id}"
          draggable="true"
          onclick="selectedElement(event)"
        >`;
          if (elementDataSet.children && elementDataSet.children.length > 0) {
            html += elementDataSet.children
              .map((child) => this.generateElementHtml(child, pdf))
              .join("");
          }
          html += `</${elementDataSet.tag}>`;
        },
        table: () => {
          html = `
          <${elementDataSet.tag}
            draggable="true"
            id="${elementDataSet.id}"
            onclick="selectedElement(event)"
            class="${!pdf ? GLOBAL_COMPONENT_STYLE : ""} ${elementDataSet.data.class}"
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
          html = `
          <${elementDataSet.tag}
            id="${elementDataSet.id}"
            class="${!pdf ? GLOBAL_COMPONENT_STYLE : ""} ${elementDataSet.data.class}"
            draggable="true"
            onclick="selectedElement(event)"
            placeholder="type here..."
          >`;
          if (elementDataSet.data.content) {
            html += elementDataSet.data.content;
          }
          html += `</${elementDataSet.tag}>`;
        },
      };
      elements[elementDataSet.tag]();
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
        this.selectedElement.dataset.id,
      );
      this.removeElementAtPath(this.schema, path);

      this.selectedElement = null;
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

      this.renderPreview();
      this.updateSchemaDisplay();
    },
    handlePreviewDragStart(event) {
      const element = event.target.closest(".draggable-component");
      const schemaData = this.findDataById(this.schema,element.id);
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
    selectedElementClick(event) {
      event.stopPropagation();
      const component = event.target.closest(".draggable-component");

      if (!component) return;
      if (this.selectedElement) {
        this.selectedElement.classList.remove("border-black","border-solid");
        this.selectedElement.classList.add("border-black/50","border-dashed");
      }
      this.selectedElement = component;
      this.selectedElement.classList.add("border-black", 'border-solid');
      this.selectedElement.classList.remove("border-black/50","border-dashed");
      const element_schema = this.findDataById(this.schema, this.selectedElement.id);

      if (element_schema) {
        this.options.class = element_schema.data.class || "";
        this.options.content = element_schema.data.content || "";
        this.options.columns = element_schema.data.columns;
        this.options.rows = element_schema.data.rows;
        this.options.src = element_schema.data.src;
      }
    },
    async saveDataOptions() {
      if (!this.selectedElement) return;

      const element_schema = this.findDataById(this.schema, this.selectedElement.id);
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
      this.selectedElement.classList.remove("border-black", 'border-solid');
      this.selectedElement.classList.add("border-black/50","border-dashed");
      this.updateElementAtPath(dataTransfer);
      this.selectedElement = null;
      this.renderPreview();
      this.updateSchemaDisplay();
    },
  },
  persist: {
    pick: ["styleEl", "cssCode", "schema", "data"],
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

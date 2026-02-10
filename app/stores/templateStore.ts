import { defineStore } from "pinia";
import { nextTick } from "vue";

interface SchemaElement {
  id?: string;
  tag: string;
  data: Record<string, any>;
  children?: SchemaElement[];
  type?: string;
}

interface Schema {
  type: string;
  children: SchemaElement[];
}

export const templateStore = defineStore("template", {
  state: () => ({
    styleEl: null as HTMLStyleElement | null,
    data: {} as Record<string, any>,
    selectedElement: null as HTMLElement | null,
    cssCode: "",
    schema: {
      type: "container",
      children: [],
    } as Schema,
    schemaJson: "",
    previewHtml: "",
    options: {
      class: "",
      content: "",
      columns: "",
      rows: "",
      src: undefined as File | undefined | string,
    },
  }),
  getters: {},
  actions: {
    renderPreview() {
      try {
        const html = this.generateLayoutHtml(this.schema);
        this.previewHtml = html;

        nextTick(() => {
          document
            .querySelectorAll("#preview .draggable-component")
            .forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.draggable = true;
              htmlEl.addEventListener("dragstart", this.handlePreviewDragStart);
              htmlEl.addEventListener("dragend", this.handlePreviewDragEnd);
              htmlEl.addEventListener("dragenter", this.onDragEnter);
              htmlEl.addEventListener("dragleave", this.onDragLeave);
            });
        });
      } catch (e) {
        console.error("Error renderizando preview:", e);
      }
    },
    generateLayoutHtml(schema: Schema, pdf = false) {
      if (!schema.children || schema.children.length === 0) return "";
      const html = `
<html>
<head>
<style>
${this.cssCode}
</style>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-background text-foreground antialiased selection:bg-primary/20">
${schema.children.map((child: any) => this.generateElementHtml(child, pdf)).join("")}
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
    generateElementHtml(element: SchemaElement, pdf = false) {
      const baseClasses = !pdf
        ? "draggable-component relative p-2 border border-dashed border-border/50 rounded-lg cursor-grab hover:border-primary/50 hover:bg-muted/10 transition-all duration-200"
        : "";

      let html = "";

      const commonAttrs = `
        id="${element.id}"
        draggable="true"
        data-schema='${JSON.stringify(element)}'
        data-id="${element.id}"
        onclick="selectedElement(event)"
      `;

      let gen: any = {
        img: () => {
          html = `
        <${element.tag}
          src='${element.data.src || ""}'
          class="${baseClasses} ${element.data.class || ""}"
          ${commonAttrs}
      />
      `;
        },
        div: () => {
          html = `<${element.tag}
          class="${baseClasses} ${element.data.class || ""}"
          ${commonAttrs}
        >`;
          if (element.children && element.children.length > 0) {
            html += element.children
              .map((child: any) => this.generateElementHtml(child, pdf))
              .join("");
          }
          html += `</${element.tag}>`;
        },
        table: () => {
          html = `          <${element.tag}
          class="${baseClasses} ${element.data.class || ""}"
          ${commonAttrs}
          >`;
          if (element.data.table) {
            html += `<thead class="bg-muted text-muted-foreground text-xs uppercase font-medium">
      <tr>
        ${element.data.columns ? element.data.columns.map((col: string) => `<th class="px-4 py-3 text-left">${col}</th>`).join("") : ""}
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      ${
        element.data.rows
          ? element.data.rows
              .map(
                (row: string[]) => `
        <tr class="hover:bg-muted/50 transition-colors">
          ${row.map((cell) => `<td class="px-4 py-3 text-sm">${cell}</td>`).join("")}
        </tr>
      `,
              )
              .join("")
          : ""
      }
    </tbody>`;
          }
          html += `</${element.tag}>`;
        },
        p: () => {
          html = `
          <${element.tag}
          class="${baseClasses} ${element.data.class || ""}"
          ${commonAttrs}
          >`;
          if (element.data.content) {
            html += element.data.content;
          }
          html += `</${element.tag}>`;
        },
      };

      if (gen[element.tag]) {
        gen[element.tag]();
      } else {
        // Fallback for generic tags if any
        html = `<${element.tag} class="${baseClasses} ${element.data.class || ""}" ${commonAttrs}>`;
        if (element.data.content) html += element.data.content;
        html += `</${element.tag}>`;
      }

      return html;
    },
    async generateDocument() {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: this.generateLayoutHtml(this.schema, true),
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
    getElementByPath(path: number[]): Schema | SchemaElement | undefined {
      let current: Schema | SchemaElement = this.schema;
      for (let index of path) {
        if (
          "children" in current &&
          current.children &&
          current.children[index]
        ) {
          current = current.children[index];
        } else {
          return undefined;
        }
      }
      return current;
    },
    findPathById(
      current: Schema | SchemaElement,
      id: string | undefined,
    ): number[] | null {
      const root = current;
      if ("id" in root && root.id === id) return [];

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
    insertElementAtPath(
      root: Schema | SchemaElement,
      element: SchemaElement,
      path: number[],
      index: number,
    ) {
      let parent: Schema | SchemaElement = root;

      for (let i = 0; i < path.length; i++) {
        const pathIndex = path[i];
        if (
          parent.children &&
          pathIndex !== undefined &&
          parent.children[pathIndex]
        ) {
          parent = parent.children[pathIndex];
        } else {
          return; // Path is invalid
        }
      }
      if (!parent.children) parent.children = [];
      parent.children.splice(index, 0, element);
    },
    removeElementAtPath(root: Schema | SchemaElement, path: number[] | null) {
      if (!path || path.length === 0) return;
      let parent: Schema | SchemaElement = root;
      for (let i = 0; i < path.length - 1; i++) {
        const pathIndex = path[i];
        if (
          parent.children &&
          pathIndex !== undefined &&
          parent.children[pathIndex]
        ) {
          parent = parent.children[pathIndex];
        } else {
          return; // Path is invalid
        }
      }
      const lastIndex = path[path.length - 1];
      if (parent.children && lastIndex !== undefined) {
        parent.children.splice(lastIndex, 1);
      }
    },
    setStyleEl(el: any) {
      this.styleEl = el;
    },
    setStyleElTexContent(css: string) {
      if (this.styleEl) this.styleEl.textContent = css;
    },
    onDrop(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const dropTarget = event.target.closest(".draggable-component");
      if (dropTarget) {
        dropTarget.classList.remove("ring-2", "ring-primary", "bg-accent/50");
        dropTarget.classList.add("border-dashed", "border-border/50");
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

      if (action === "move" && dropTarget && dropTarget.dataset.id === id) {
        console.warn(
          "Operación cancelada: No puedes soltar un elemento sobre sí mismo.",
        );
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
        const sourcePath = this.findPathById(this.schema, id);
        if (!sourcePath) return;

        nuevoElemento = schemaData;
        this.removeElementAtPath(this.schema, sourcePath);
      }

      const insertInto = (targetSchema: any) => {
        if (!targetSchema.children) targetSchema.children = [];
        targetSchema.children.push(nuevoElemento);
      };

      if (dropTarget) {
        const targetId = dropTarget.dataset.id;
        const targetPath = this.findPathById(this.schema, targetId);

        const rect = dropTarget.getBoundingClientRect();
        const relativeY = event.clientY - rect.top;
        const isAfter = relativeY > rect.height / 2;

        const targetSchema = this.getElementByPath(targetPath);

        if (
          targetSchema &&
          (targetSchema.tag === "div" || targetSchema.tag === "section")
        ) {
          insertInto(targetSchema);
        } else {
          const parentPath = targetPath.slice(0, -1);
          const indexInParent = targetPath[targetPath.length - 1];
          const finalIndex = isAfter ? indexInParent + 1 : indexInParent;

          this.insertIntoParent(
            this.schema,
            nuevoElemento,
            parentPath,
            finalIndex,
          );
        }
      } else {
        this.schema.children.push(nuevoElemento as SchemaElement);
      }

      this.renderPreview();
      this.updateSchemaDisplay();
    },

    insertIntoParent(
      root: Schema | SchemaElement,
      element: SchemaElement,
      parentPath: number[],
      index: number,
    ) {
      let parent: Schema | SchemaElement = root;
      for (let i of parentPath) {
        if (parent.children && parent.children[i]) {
          parent = parent.children[i];
        } else {
          return; // Invalid path
        }
      }
      if (!parent.children) parent.children = [];
      parent.children.splice(index, 0, element);
    },
    handlePreviewDragStart(event: any) {
      const element = event.target.closest(".draggable-component");
      const schemaData = JSON.parse(element.dataset.schema);
      const id = element.dataset.id;
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          action: "move",
          id,
          schemaData,
        }),
      );
    },
    handlePreviewDragEnd(event: any) {
      this.renderPreview();
    },
    onDragEnter(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target.closest(".draggable-component");

      if (target) {
        target.classList.add("ring-2", "ring-primary", "bg-accent/10");
        target.classList.remove("border-dashed", "border-border/50");
      }
    },
    onDragLeave(event: any) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target.closest(".draggable-component");

      if (target) {
        target.classList.remove("ring-2", "ring-primary", "bg-accent/10");
        target.classList.add("border-dashed", "border-border/50");
      }
    },
    replace(
      root: Schema | SchemaElement,
      element: SchemaElement,
    ): SchemaElement[] {
      if (!root.children) return [];
      return root.children.map((v: any) => {
        if (v.id !== element.id) {
          if (v.children) {
            v.children = this.replace(v, element);
          }
          return v;
        } else {
          return element;
        }
      });
    },
    updateElementAtPath(element: SchemaElement) {
      this.schema.children = this.replace(this.schema, element);
    },
    selectedElementClick(event: any) {
      event.stopPropagation();
      const component = event.target.closest(".draggable-component");

      if (!component) return;

      if (this.selectedElement) {
        this.selectedElement.classList.remove(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        this.selectedElement.classList.add("border-border/50");
      }

      this.selectedElement = component;
      if (this.selectedElement) {
        this.selectedElement.classList.add(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        this.selectedElement.classList.remove("border-border/50");

        const schemaData = this.selectedElement.dataset.schema;
        if (!schemaData) return;

        const element_schema = JSON.parse(schemaData);

        if (element_schema) {
          this.options.class = element_schema.data.class || "";
          this.options.content = element_schema.data.content || "";
          this.options.columns = JSON.stringify(
            element_schema.data.columns || [],
          );
          this.options.rows = JSON.stringify(element_schema.data.rows || []);
          this.options.src = element_schema.data.src;
        }
      }
    },
    async saveDataOptions() {
      if (!this.selectedElement) return;

      const schemaData = this.selectedElement.dataset.schema;
      if (!schemaData) return;

      const element_schema = JSON.parse(schemaData);
      let data = {
        ...element_schema.data,
      };

      if (this.options.class) data.class = this.options.class;

      try {
        if (this.options.columns)
          data.columns = JSON.parse(this.options.columns);
      } catch (e) {}

      try {
        if (this.options.rows) data.rows = JSON.parse(this.options.rows);
      } catch (e) {}

      if (this.options.content) data.content = this.options.content;

      if (this.options.src) {
        try {
          if (
            typeof this.options.src !== "string" &&
            (this.options.src as any).type?.includes("image")
          ) {
            data.src = await fileToBase64(this.options.src as any);
          } else {
            // Keep existing string if not changed
            data.src = this.options.src;
          }
        } catch (e) {}
      }

      const dataTransfer = {
        ...element_schema,
        data,
      };
      this.updateElementAtPath(dataTransfer);
      this.selectedElement = null;
      this.renderPreview();
      this.updateSchemaDisplay();
    },
  },
  persist: true,
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

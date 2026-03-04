import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import handlebars from "handlebars";
import { applyBorderStyles, clearBorderStyles, findDataById, findIndexElement, findPathById, generateLayoutHeaderFooterHtml, generateLayoutHtml, getDropTarget, getElementByPath, getInsertType, insertElementAtPath, insertNodeRelativeTo, removeElementAtPath, replace, sleep } from "./template";
import type { ElementDataSet } from "./template";

export type SectionType = "body" | "footer" | "header";
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
    selectedType: 'body',
    cssCode: "",
    schema: {
      type: "container",
      id: "preview",
      tag: 'div',
      children: [],
    },
    footer: {
      type: "container",
      id: "footer",
      tag: 'div',
      children: [],
    },
    header: {
      type: "container",
      id: "header",
      tag: 'div',
      children: [],
    },
    schemaJson: "",
    previewHtml: "",
    previewHtmlFooter: "",
    previewHtmlHeader: "",
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
    _bindEventsToContainer(selector: string, type: SectionType) {
      document.querySelectorAll(`${selector} .draggable-component`).forEach((el) => {
        const element = el as HTMLElement;
        element.draggable = true;
        element.ondragstart = (e) => this.handlePreviewDragStart(e as DragEvent, type);
        element.ondragend = () => this.handlePreviewDragEnd();
        element.ondragenter = this.onDragEnter;
        element.ondragleave = this.onDragLeave;
        element.ondragover = (e) => this.onDragOver(e as DragEvent, type);
        element.onclick = (e) => this.selectedElementClick(e, type);
      });

      document.querySelectorAll(`${selector} [data-function="delete"]`).forEach((el) => {
        (el as HTMLElement).onclick = (e) => {
          e.stopPropagation();
          const id = (el as HTMLElement).dataset.id;
          if (id) this.deleteElementById(id, type);
        };
      });
    },
    _getRoot(type: SectionType): ElementDataSet {
      return type === 'footer' ? this.footer : type === 'header' ? this.header : this.schema;
    },
    buildHtml(schemaData: ElementDataSet) {
      let html = generateLayoutHtml({ schema: schemaData, cssCode: this.cssCode });
      return handlebars.compile(html)(this.data);
    },
    renderPreview() {
      try {
        this.previewHtml = this.buildHtml(this.schema);
        this.previewHtmlFooter = this.buildHtml(this.footer);
        this.previewHtmlHeader = this.buildHtml(this.header);
        nextTick(() => {
          this._bindEventsToContainer("#preview", "body");
          this._bindEventsToContainer("#footer", "footer");
          this._bindEventsToContainer("#header", "header");
        });
      } catch (e) {
        console.error("Error renderizando preview:", e);
      }
    },
    updateSchemaDisplay() {
      this.schemaJson = JSON.stringify(
        { style: this.cssCode, schema: this.schema, header: this.header, footer: this.footer },
        null,
        2,
      ).trim();
    },
    async generateDocument() {
      const html = generateLayoutHtml({ schema: this.schema as ElementDataSet, cssCode: this.cssCode, pdf: true })
      const header = generateLayoutHeaderFooterHtml({ schema: this.header as ElementDataSet, cssCode: this.cssCode, pdf: true })
      const footer = generateLayoutHeaderFooterHtml({ schema: this.footer as ElementDataSet, cssCode: this.cssCode, pdf: true })
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: handlebars.compile(html)(this.data),
          header: handlebars.compile(header)(this.data),
          footer: handlebars.compile(footer)(this.data),
        }),
      });
      const url = URL.createObjectURL(await res.blob());
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    },
    deleteElementById(id: string, type: "body" | "footer" | "header" = "body") {
      const root = this._getRoot(type);
      const path = findPathById(
        {
          root,
          id,
        }
      );
      if (path) {
        removeElementAtPath({ root, path });
        this.selectedElement = null;
        this.pushHistory();
        this.renderPreview();
        this.updateSchemaDisplay();
      }
    },
    setStyleEl(el) {
      this.styleEl = el;
    },
    setStyleElTexContent(css) {
      if (this.styleEl) this.styleEl.textContent = css;
    },
    onDragOver(event, type: "body" | "footer" | "header" = "body") {
      event.preventDefault();
      event.stopPropagation();
      const target = event.target.closest(".draggable-component");
      if (!target) return;

      const root = this._getRoot(type);

      const targetNode = findDataById({ root, id: target.id });
      if (!targetNode) return;

      let pos = getInsertType({ event, node: targetNode, schema: root, targetId: target.id })
      this.position = pos
      applyBorderStyles(target, pos.insertType)
    },
    onDrop(event: DragEvent, type: SectionType = "body") {
      event.preventDefault();
      event.stopPropagation();

      let transferData;
      try {
        transferData = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch (e) {
        return;
      }

      let { action = null, id, schemaData } = transferData
      schemaData = schemaData || transferData

      let dropTarget = getDropTarget(event, this.position.insertType === 'inside' ? true : false);

      if (dropTarget) clearBorderStyles(dropTarget)
      if (action === "move" && dropTarget && dropTarget.id === id) return;

      const nuevoElemento: ElementDataSet = action === null
        ? {
          id: crypto.randomUUID().replace(/-/g, ''),
          tag: schemaData.tag,
          name: schemaData.nombre,
          data: { ...schemaData.data },
          children: []
        }
        : schemaData


      const root = this._getRoot(type);
      const sourcePath = findPathById({ root, id });
      if (sourcePath) removeElementAtPath({ root, path: sourcePath });
      if (dropTarget && this.position) {
        const { elementId, insertType, index } = this.position
        const targetPath = findPathById({ root, id: dropTarget.id })
        const targetNode = getElementByPath({ root, path: targetPath })
        clearBorderStyles(document.getElementById(elementId))
        if (targetNode?.tag === 'div') {
          if (insertType === 'inside') {
            if (targetNode) targetNode.children.push(nuevoElemento)
          } else {
            if (dropTarget.id === 'preview') insertElementAtPath({ root, element: nuevoElemento, path: [], index })
            else
              insertElementAtPath({ root, element: nuevoElemento, path: targetPath, index })
          }
        }
      } else {
        const { elementId, index } = this.position
        if (dropTarget) clearBorderStyles(document.getElementById(elementId))
        insertElementAtPath({ root, element: nuevoElemento, path: [], index })
      }
      this.pushHistory();
      this.renderPreview();
      this.updateSchemaDisplay();
    },
    handlePreviewDragStart(event: DragEvent, type: SectionType = "body") {
      const element = (event.target as HTMLElement).closest(".draggable-component");
      const root = this._getRoot(type);
      const schemaData = findDataById({ root, id: element.id });
      if (!schemaData) return
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
    onDragEnter(event: Event) {
      event.preventDefault();
      event.stopPropagation();

      const target = (event.target as HTMLElement).closest(".draggable-component");
      if (target) target.classList.remove("border-dashed", "border-black/50");
    },
    onDragLeave(event: Event) {
      event.preventDefault();
      event.stopPropagation();

      const target = (event.target as HTMLElement).closest(".draggable-component");

      if (target) {
        target.classList.remove(
          "border-black",
          "border-solid",
          "border-t-4",
          "border-b-4",
        );
        target.classList.add("border-dashed", "border-black/50");
      }
    },
    updateElementAtPath(element: ElementDataSet, type: SectionType = "body") {
      const root = this._getRoot(type);
      root.children = replace({ root, element });
    },
    clearSelectedElemen() {
      if (this.selectedElement) {
        this.selectedElement.classList.remove("border-black", 'border-solid');
        this.selectedElement.classList.add("border-black/50", "border-dashed");
      }
      this.selectedElement = null;
      this.selectedNode = null;
      this.selectedType = 'body'
    },
    selectedElementClick(event: Event, type: SectionType = "body") {
      event.preventDefault();
      event.stopPropagation();
      this.selectedType = type
      const component = (event.target as HTMLElement).closest(".draggable-component");

      if (!component) return;

      if (this.selectedElement) {
        this.selectedElement.classList.remove("border-black", "border-solid");
        this.selectedElement.classList.add("border-black/50", "border-dashed");
      }

      this.selectedElement = component;
      this.selectedElement.classList.add("border-black", 'border-solid');
      this.selectedElement.classList.remove("border-black/50", "border-dashed");

      const root = this._getRoot(type);
      this.selectedNode = findDataById({ root, id: this.selectedElement.id });

      if (this.selectedNode) {
        this.options.class = this.selectedNode.data.class || "";
        this.options.content = this.selectedNode.data.content || "";
        this.options.columns = this.selectedNode.data.columns;
        this.options.rows = this.selectedNode.data.rows;
        this.options.src = this.selectedNode.data.src;
        this.options.name = this.selectedNode.data.name;
        this.options.checkValue = this.selectedNode.data.value.toString();
      }
    },
    async saveDataOptions() {
      if (!this.selectedElement || !this.selectedNode) return;

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
      if (this.options.name) {
        data.name = this.options.name;
      }
      if (this.options.checkValue != null) {
        data.value = this.options.checkValue == 'true' ? true : false;
      }
      const dataTransfer = {
        ...element_schema,
        data,
      };
      this.selectedNode = dataTransfer;
      this.updateElementAtPath(dataTransfer, this.selectedType);
      // this.selectedElement = null;
      this.renderPreview();
      this.updateSchemaDisplay();
    },
  },
  persist: {
    pick: ["styleEl", "cssCode", "schema", "data", "history", "redoStack", "footer", "header"],
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

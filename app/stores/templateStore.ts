import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import handlebars from "handlebars";
import { applyBorderStyles, applyRowChildFlex, clearBorderStyles, findDataById, findIndexElement, findPathById, generateLayoutHeaderFooterHtml, generateLayoutHtml, getDropTarget, getElementByPath, getInsertType, insertElementAtPath, insertNodeRelativeTo, removeElementAtPath, replace, sleep } from "./template";
import { readEachPath } from "./tag-class";
import type { ElementDataSet } from "./template";
import type { TemplateDoc } from "../templates/types";

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
    /**
     * Fuente de datos de la pestaña Datos → Fuente. `map` se guarda como texto
     * para que Monaco pueda contener JSON a medio editar; se parsea al cargar.
     */
    dataSource: {
      kind: "rest" as "rest" | "sql",
      rest: { url: "", method: "GET", path: "" },
      sql: { host: "", port: "5432", user: "", database: "", ssl: false, query: "" },
      map: `{
  "name": "rows[0].name",
  "create_date": "rows[0].create_date",
  "table.cols": ["Service", "Volume", "Revenue"],
  "table.rows": { "from": "rows", "select": ["service", "volume", "revenue"] }
}`,
    },
    /** Credenciales: solo en memoria, nunca en sessionStorage. */
    dataSecrets: { sqlPassword: "", restHeaders: "" },
    position: -1,
    selectedElement: null,
    selectedNode: null,
    selectedType: 'body',
    cssCode: "",
    emptyHint: "drag a component and drop it to the canvas",
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
    /**
     * Ajustes de página para el export PDF. Por defecto reproducen el
     * comportamiento histórico (carta, vertical, 10mm, header y pie repetidos).
     * No forman parte del historial de deshacer (solo se serializa el body).
     */
    page: {
      format: "letter" as "letter" | "a4" | "legal" | "oficio",
      orientation: "portrait" as "portrait" | "landscape",
      /** Márgenes en mm. */
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
      /** Checkbox: header en todas las páginas (false = solo la primera). */
      headerRepeat: true,
      /** Checkbox: pie en todas las páginas (false = solo al final del contenido). */
      footerRepeat: true,
    },
    options: {
      class: "",
      content: "",
      columns: "",
      rows: "",
      /** Rutas del `{{#each}}` de columnas y filas (solo UI; el markup manda). */
      colsPath: "",
      rowsPath: "",
      /** Estado de la Casilla (`data.value`); solo lo usa `tag: "checkbox"`. */
      checkValue: false,
      src: "",
      /** Nombre visible del nodo (la etiqueta que muestra el lienzo). */
      nodeName: "",
      /** Alto en px del código de barras (`data.height`). */
      height: "",
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
      // `history` guarda el estado *tras* cada cambio, así que hacen falta dos
      // entradas para poder volver atrás (con una sola no hay estado previo).
      if (this.history.length < 2) return;
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
      let html = generateLayoutHtml({ schema: schemaData, cssCode: this.cssCode, emptyHint: this.emptyHint });
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
        { style: this.cssCode, page: this.page, schema: this.schema, header: this.header, footer: this.footer },
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
          css: this.cssCode || "",
          page: {
            format: this.page.format,
            orientation: this.page.orientation,
            margins: { ...this.page.margins },
            headerRepeat: this.page.headerRepeat,
            footerRepeat: this.page.footerRepeat,
          },
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
    /** Borra el elemento seleccionado (botón del panel derecho y Backspace). */
    deleteElement() {
      if (this.selectedElement) this.deleteElementById(this.selectedElement.id, this.selectedType);
    },

    setStyleEl(el) {
      this.styleEl = el;
    },
    /**
     * Garantiza que existe el `<style data-dynamic-css>` de la pestaña Estilos.
     * `persist` guarda `styleEl` en sessionStorage, así que tras recargar el
     * valor persistido es un objeto plano (`{}`) y escribir en él no hace nada;
     * además la pestaña Estilos solo se monta cuando el usuario la abre.
     */
    ensureStyleEl() {
      if (typeof document === "undefined") return;
      if (this.styleEl instanceof HTMLStyleElement && document.head.contains(this.styleEl)) return;
      let el = document.head.querySelector("style[data-dynamic-css]");
      if (!el) {
        el = document.createElement("style");
        el.setAttribute("data-dynamic-css", "true");
        document.head.appendChild(el);
      }
      this.styleEl = el;
    },
    setStyleElTexContent(css) {
      this.ensureStyleEl();
      if (this.styleEl) this.styleEl.textContent = css;
    },
    /**
     * Carga una plantilla precreada reemplazando las tres zonas, los datos y el
     * CSS. El cuerpo actual queda en el historial (deshacer), pero cabecera, pie
     * y datos no: por eso la galería pide confirmación antes.
     * `pushHistory` va después de mutar, igual que en `onDrop`/`deleteElementById`.
     */
    loadTemplate(doc: TemplateDoc) {
      // Snapshot del lienzo anterior: sin él, cargar una plantilla sobre un
      // lienzo vacío dejaría la deshacer sin estado previo al que volver.
      const previous = JSON.stringify(this.schema);
      if (this.history[this.history.length - 1] !== previous) {
        this.history.push(previous);
        if (this.history.length > 50) this.history.shift();
      }
      this.schema = doc.schema;
      this.header = doc.header;
      this.footer = doc.footer;
      this.data = doc.data;
      this.cssCode = doc.cssCode;
      this.clearSelectedElemen();
      this.pushHistory();
      this.setStyleElTexContent(doc.cssCode);
      this.renderPreview();
      this.updateSchemaDisplay();
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
          // targetNode es el contenedor donde acaba el elemento (dentro de él, o
          // como hermano cuando target es su padre). Si es un Row, reparte ancho.
          applyRowChildFlex(nuevoElemento, targetNode)
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
        applyRowChildFlex(nuevoElemento, root)
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
        this.options.colsPath = readEachPath(this.selectedNode.data.columns);
        this.options.rowsPath = readEachPath(this.selectedNode.data.rows);
        this.options.src = this.selectedNode.data.src;
        this.options.name = this.selectedNode.data.name;
        this.options.nodeName = this.selectedNode.name || "";
        this.options.height =
          this.selectedNode.data.height != null ? String(this.selectedNode.data.height) : "";
        this.options.checkValue = this.selectedNode.data.value === true;
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
      if (this.options.height !== "" && this.options.height != null) {
        const height = Number(this.options.height);
        if (Number.isFinite(height)) data.height = height;
      }
      // `value` solo lo usa la Casilla. Antes se escribía en todo nodo guardado
      // (checkValue valía "false", no null) y hacía aparecer el campo "Valor" en
      // tablas y demás; aquí también se limpia el que quedara guardado.
      if (element_schema.tag === "checkbox") {
        data.value = this.options.checkValue === true;
      } else {
        delete data.value;
      }
      // `name` es la etiqueta que ven el lienzo y el JSON; se edita con el campo
      // "Nombre del componente" y un valor vacío conserva la que ya tenía.
      const nodeName =
        typeof this.options.nodeName === "string" ? this.options.nodeName.trim() : "";
      const dataTransfer = {
        ...element_schema,
        name: nodeName || element_schema.name,
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
    pick: ["styleEl", "cssCode", "page", "schema", "data", "dataSource", "history", "redoStack", "footer", "header"],
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

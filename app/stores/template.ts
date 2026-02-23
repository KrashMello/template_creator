interface ElementDataSet {
  id: string;
  tag: string;
  name: string;
  data: Record<string, any>;
  children: ElementDataSet[];
};

const GLOBAL_COMPONENT_STYLE =
  "draggable-component p-3 border-2 border-dashed border-black/50 bg-background rounded-xl " +
  "hover:bg-accent/50 transition-all duration-200 " +
  "cursor-grab active:cursor-grabbing select-none " +
  "flex flex-col gap-1.5 min-h-12 w-full"
  ;

export const generateElementHtml = (elementDataSet: ElementDataSet, pdf = false): string => {
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
          .map((child) => generateElementHtml(child, pdf))
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
}
export const generateLayoutHtml = (opt: { schema: ElementDataSet, cssCode?: string, pdf: boolean }): string => {
  let { schema, pdf, cssCode } = opt;
  pdf = pdf || false;
  if (!schema.children || schema.children.length === 0) return `<div class="flex flex-1 gap-3 flex-col justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="text-slate-400"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg><span class="text-sm text-slate-400">drag a component and drop it to the canvas</span></div>`;
  const html = `
<html>
<head>
<style>
${cssCode || ''}
</style>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body>
<div class="flex-1 flex flex-col gap-2 pb-2">
${schema.children.map((child) => generateElementHtml(child, pdf)).join("")}
</div>
</body>
</html>
`;
  return html;
}
export const insertNodeRelativeTo = (
  root: ElementDataSet,
  newNode: ElementDataSet,
  targetId: string,
  position: "before" | "after"
): boolean => {
  return insertInChildren(root.children, newNode, targetId, position);
}

const insertInChildren = (
  children: ElementDataSet[],
  newNode: ElementDataSet,
  targetId: string,
  position: "before" | "after"
): boolean => {
  const idx = children.findIndex((c) => c.id === targetId);
  if (idx === -1) {
    const insertAt = position === "after" ? idx + 1 : idx;
    children.splice(insertAt, 0, newNode);
    return true;
  }
  for (const child of children) {
    if (child.children && insertInChildren(child.children, newNode, targetId, position)) return true;
  }
  return false;
}

const insertElementAtPath = (root: ElementDataSet, element: ElementDataSet, path, index) => {
  let parent = root;
  for (let i = 0; i < path.length; i++) {
    parent = parent.children[path[i]];
  }
  if (!parent.children) parent.children = [];
  parent.children.splice(index, 0, element);
}

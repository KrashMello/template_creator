interface ElementDataSet {
  id: string;
  tag: string;
  name: string;
  data: Record<string, any>;
  children: ElementDataSet[];
};

interface DropPosition {
  elementId: string
  insertType: 'before' | 'after' | 'inside'
  index: number
}
const GLOBAL_COMPONENT_STYLE =
  "draggable-component p-3 border-2 border-dashed border-black/50 bg-background rounded-xl " +
  "hover:bg-accent/50 transition-all duration-200 " +
  "cursor-grab active:cursor-grabbing select-none " +
  "flex flex-col gap-1.5 min-h-12 w-full"
  ;
const ICONS = {
  drag: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="size-3"><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg>`,
  empty: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="text-slate-400"><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg>`
};

export const generateElementHtml = (elementDataSet: ElementDataSet, pdf = false): string => {
  const { id, tag, name, data, children } = elementDataSet;
  const childHtml = children?.length ? children.map(c => generateElementHtml(c, pdf)).join("") : "";
  const className = data.class || "";

  let innerContent = "";

  switch (tag) {
    case 'img':
      innerContent = `<${tag} src='${data.src}' class="${className}" />`;
      break;
    case 'div':
      innerContent = `<${tag} class="${className}">${childHtml}</${tag}>`;
      break;
    case 'table':
      innerContent = `
        <${tag} class="${className}">
          ${data.table ? `
            <thead class="dark:bg-zinc-50 bg-zinc-900 border-b dark:border-zinc-200 border-zinc-800">
              <tr class="dark:text-zinc-500 font-medium text-zinc-400">${data.columns || ""}</tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">${data.rows || ""}</tbody>
          ` : ""}
        </${tag}>`;
      break;
    case 'checkbox':
      innerContent = `
        <${tag} class="${className}">
          <div>
            <input type="checkbox" id="${id}-checkbox" ${data.value ? 'checked' : ''}/>
            <label for="${id}-checkbox">${data.name || name}</label>
          </div>
        </${tag}>`;
      break;
    case 'p':
      innerContent = `<${tag} class="${className}">${data.content || ""}</${tag}>`;
      break;
    default:
      innerContent = `<${tag} class="${className}">${childHtml}</${tag}>`;
  }

  if (pdf) return innerContent;

  return `
    <div id="${id}" class="${GLOBAL_COMPONENT_STYLE}" draggable="true">
      <div class="flex group items-center font-bold text-sm gap-4">
        ${ICONS.drag}
        <span class="flex-1">${name ?? tag}</span>
        <button class="hidden group-hover:flex items-center justify-center size-5 rounded-sm bg-red-100 text-red-500 text-sm font-bold leading-none border-none cursor-pointer [transition:all_0.15s] z-50" data-id="${id}" data-function="delete">×</button>
      </div>
      ${innerContent}
    </div>`;
};
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
export const generateLayoutHeaderFooterHtml = (opt: { schema: ElementDataSet, cssCode?: string, pdf: boolean }): string => {
  let { schema, pdf, cssCode } = opt;
  pdf = pdf || false;
  if (!schema.children || schema.children.length === 0) return `<div class="flex flex-1 gap-3 flex-col justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="text-slate-400"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg><span class="text-sm text-slate-400">drag a component and drop it to the canvas</span></div>`;
  const html = `
${schema.children.map((child) => generateElementHtml(child, pdf)).join("")}
`;
  return html;
}
export const findIndexElement = (opt: {
  root: ElementDataSet[],
  id: string,
  position: "before" | "after" | "inside"
}): number => {
  const { root, id, position } = opt;
  const idx = root.findIndex((c) => c.id === id);
  if (idx !== -1) {
    return position === "after" ? idx + 1 : idx;
  }

  for (const child of root) {
    const indexElement = findIndexElement({ root: child.children, id, position });
    if (indexElement !== -1) return indexElement;
  }

  return -1;
}
export const insertElementAtPath = (opt: { root: ElementDataSet, element: ElementDataSet, path: Array<number>, index: number }) => {
  const { root, element, path, index } = opt;
  let parent = root;
  if (path.length === 0) {
    parent.children.splice(index, 0, element);
  } else {
    for (let i = 0; i < path.length; i++) {
      parent = parent.children[path[i]];
    }
    parent.children.splice(index, 0, element);
  }
}
export const removeElementAtPath = (opt: { root: ElementDataSet, path: Array<number> }) => {
  const { root, path } = opt;
  if (!path || path.length === 0) return;
  let parent = root;
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent.children[path[i]];
  }
  const lastIndex = path[path.length - 1];
  parent.children.splice(lastIndex, 1);
}

export const findPathById = (opt: { root: ElementDataSet, id: string }) => {
  const { root, id } = opt;
  if (root.id === id) return [];
  if (id === 'preview') return []
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    const path = findPathById({ root: child, id });
    if (path !== null) {
      return [i, ...path];
    }
  }
  return null;
}

export const getElementByPath = (opt: { root: ElementDataSet, path: Array<number> }) => {
  const { root, path } = opt;
  let current = root;
  for (let index of path) {
    current = current.children[index];
  }
  return current;
}
export const findDataById = (opt: { root: ElementDataSet, id: string }) => {
  const { root, id } = opt;
  if (root.id === id) return root;
  if (!root.children) return null;
  for (const child of root.children) {
    const result = findDataById({ root: child, id });
    if (result !== null) return result;
  }
  return null;
}

export const replace = (opt: { root: ElementDataSet, element: ElementDataSet }) => {
  const { root, element } = opt;
  return root.children.map((v) => {
    if (v.id !== element.id) {
      v.children = replace({ root: v, element });
      return v;
    } else {
      return element;
    }
  });
}
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getDropTarget = (event: DragEvent, isInside: boolean): HTMLElement | null => {
  const target = event.target as HTMLElement
  const draggable = target.closest('.draggable-component')
  if (!draggable) return null

  const parent = draggable.parentElement?.parentElement
  return parent && !isInside ? parent : draggable
}
export const getInsertType = (opt: { event: DragEvent, node: ElementDataSet, schema: ElementDataSet, targetId: string }): DropPosition => {
  const { event, node, schema, targetId } = opt
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const relativeY = event.clientY - rect.top
  const height = rect.height

  let insertType: 'before' | 'after' | 'inside' = 'after'
  if (node.tag === 'div') {
    const threshold = Math.min(height * 0.25, 15)
    if (relativeY < threshold) insertType = 'before'
    else if (relativeY > height - threshold) insertType = 'after'
    else insertType = 'inside'
  } else {
    insertType = relativeY < height / 2 ? 'before' : 'after'
  }

  const index = findIndexElement({ root: schema.children, id: targetId, position: insertType }) || 0
  return { elementId: target.id, insertType, index }
}

export const applyBorderStyles = (target: HTMLElement, insertType: DropPosition['insertType']) => {
  target.classList.remove('border-black/50', 'border-t-4', 'border-b-4', 'border-solid')
  if (insertType === 'before') {
    target.classList.add('border-t-4', 'border-black', 'border-solid')
  } else if (insertType === 'after') {
    target.classList.add('border-b-4', 'border-black', 'border-solid')
  } else {
    target.classList.add('border-2', 'border-black', 'border-solid')
  }
}

export const clearBorderStyles = (target: HTMLElement) => {
  target.classList.remove('border-t-4', 'border-b-4', 'border-2', 'border-black', 'border-solid', 'border-dashed', 'border-black/50')
  target.classList.add('border-dashed', 'border-black/50')
}

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

export const generateElementHtml = (elementDataSet: ElementDataSet, pdf = false): string => {
  let html = "";
  const divDraggable = `<div 
      id="${elementDataSet.id}"
      class="${!pdf ? GLOBAL_COMPONENT_STYLE : ""}"
      draggable="true"
      >
      <div class="flex group items-center font-bold text-sm gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="size-3"><!-- Icon from Iconoir by Luca Burgio - https://github.com/iconoir-icons/iconoir/blob/main/LICENSE --><path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="m5.212 15.111l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848L6.06 15.111a.6.6 0 0 1-.848 0Zm6.364 6.365l-2.687-2.687a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.688a.6.6 0 0 1-.848 0Zm0-12.729L8.889 6.06a.6.6 0 0 1 0-.849l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .849l-2.687 2.687a.6.6 0 0 1-.848 0Zm6.364 6.364l-2.687-2.687a.6.6 0 0 1 0-.848l2.687-2.687a.6.6 0 0 1 .848 0l2.687 2.687a.6.6 0 0 1 0 .848l-2.687 2.687a.6.6 0 0 1-.848 0Z"/></svg>
        <span class="flex-1">${elementDataSet.name ?? elementDataSet.tag}</span>
        <button class="hidden group-hover:flex items-center justify-center size-5 rounded-sm bg-red-100 text-red-500 text-sm font-bold leading-none border-none cursor-pointer [transition:all_0.15s] z-50" data-id="${elementDataSet.id}" data-function="delete">×</button>
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
    checkbox: () => {
      html += `
          <${elementDataSet.tag}
            class="${elementDataSet.data.class}"
          >`;
      if (elementDataSet.data.value) {
        html += ` <div>
    <input type="checkbox" id="${elementDataSet.id}-checkbox" checked/>
    <label for="${elementDataSet.id}-checkbox">${elementDataSet.data.name}</label>
  </div>`
      } else {
        html += `<div>
    <input type="checkbox" id="${elementDataSet.id}-checkbox" />
    <label for="${elementDataSet.id}-checkbox">${elementDataSet.data.name}</label>
  </div>`
      }
      html += `</${elementDataSet.tag}>`;
    },
    p: () => {
      html += `
          <${elementDataSet.tag}
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
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getParent = (event, id: string) => {
  console.log(event, id)
  if (event.parentElement.id === id) return event.parentElement
  else getParent(event.parentElement, id)
}
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


function onDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  let dropTarget = null;
  const dropTarget = event.target.closest(".draggable-component");
  if (dropTarget) {
    dropTarget.classList.remove(
      "border-black",
      "border-solid",
      "border-t-4",
      "border-b-4",
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

  const sourcePath = findPathById({ root: this.schema, id });

  if (dropTarget) {
    const targetId = dropTarget.id;
    const targetPath = findPathById({ root: this.schema, id: targetId });
    const targetNode = getElementByPath({ root: this.schema, path: targetPath });

    const rect = dropTarget.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const height = rect.height;

    let insertType = 'after';
    if (targetNode?.tag === 'div') {
      const threshold = Math.min(height * 0.25, 15);
      if (relativeY < threshold) insertType = 'before';
      else if (relativeY > height - threshold) insertType = 'after';
      else insertType = 'inside';
    } else {
      insertType = relativeY < height / 2 ? 'before' : 'after';
    }

    if (insertType === 'inside') {
      if (!targetNode.children) targetNode.children = [];
      targetNode.children.push(nuevoElemento);
      if (sourcePath) {
        const newSourcePath = findPathById({ root: this.schema, id });
        if (newSourcePath) removeElementAtPath({ root: this.schema, path: newSourcePath });
      }
    } else {
      const parentPath = targetPath.slice(0, -1);
      const indexInParent = targetPath[targetPath.length - 1];
      const finalIndex = insertType === 'after' ? indexInParent + 1 : indexInParent;
      insertElementAtPath({ root: this.schema, element: nuevoElemento, path: parentPath, index: finalIndex });
      if (sourcePath) {
        const newSourcePath = findPathById({ root: this.schema, id });
        if (newSourcePath) removeElementAtPath({ root: this.schema, path: newSourcePath });
      }
    }
  } else {
    this.schema.children.push(nuevoElemento);
    if (sourcePath) {
      const newSourcePath = findPathById({ root: this.schema, id });
      if (newSourcePath) removeElementAtPath({ root: this.schema, path: newSourcePath });
    }
  }
  this.pushHistory();
  this.renderPreview();
  this.updateSchemaDisplay();
},

function onDragOver(event) {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest(".draggable-component");
  if (!target) return;

  const targetNode = findDataById({ root: this.schema, id: target.id });
  if (!targetNode) return;

  const rect = target.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  const height = rect.height;

  // Clean up previous classes
  target.classList.remove(
    "border-dashed",
    "border-black/50",
    "border-t-4",
    "border-b-4",
  );

  let insertType = 'after';

  if (targetNode.tag === 'div') {
    // Container: checks for Top/Bottom/Inside
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

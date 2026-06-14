// Walks TipTap JSON and returns array of plain-text strings, one per leaf block.
export function blocksToText(node, acc = []) {
  if (!node) return acc;
  if (Array.isArray(node)) {
    node.forEach((n) => blocksToText(n, acc));
    return acc;
  }
  if (node.type === 'text') {
    acc.push(node.text || '');
    return acc;
  }
  const blockTypes = new Set([
    'paragraph',
    'heading',
    'blockquote',
    'listItem',
    'codeBlock',
    'bulletList',
    'orderedList',
  ]);
  if (blockTypes.has(node.type)) {
    const text = collectText(node);
    if (text.trim().length) acc.push(text);
  } else if (node.content) {
    blocksToText(node.content, acc);
  }
  return acc;
}

function collectText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (!node.content) return '';
  return node.content.map(collectText).join(node.type === 'paragraph' ? '' : ' ');
}

// LCS-based diff over array of block strings.
function diffBlocks(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: 'unchanged', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: 'removed', text: a[i] });
      i++;
    } else {
      out.push({ type: 'added', text: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: 'removed', text: a[i++] });
  while (j < m) out.push({ type: 'added', text: b[j++] });
  return out;
}

export function diffTiptap(fromJson, toJson) {
  const a = blocksToText(fromJson);
  const b = blocksToText(toJson);
  return diffBlocks(a, b);
}

export function tiptapToPlainText(json) {
  return blocksToText(json).join('\n');
}

import { toPng } from "html-to-image";

/** Renders a DOM node to PNG and triggers a browser download. */
export async function downloadNodeAsPng(
  node: HTMLElement,
  fileName: string,
  targetWidth?: number,
) {
  const scale = targetWidth ? targetWidth / node.offsetWidth : 2;
  const dataUrl = await toPng(node, {
    pixelRatio: scale,
    cacheBust: true,
  });
  const link = document.createElement("a");
  link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

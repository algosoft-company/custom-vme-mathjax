import Quill from "quill";

const Embed = Quill.import("blots/embed");

declare global {
  interface Window {
    MathJax: any;
  }
}

class MathFormulaBlot extends (Embed as any) {
  static blotName = "formula";
  static tagName = "span";
  static className = "ql-formula";

  static create(value: any): HTMLElement {
    const node = super.create() as HTMLElement;
    const latex = typeof value === "string" ? value : value.latex;
    const dir = typeof value === "string" ? "ltr" : value.dir || "ltr";

    node.setAttribute("data-latex", latex);
    node.setAttribute("dir", dir);

    const script = document.createElement("script");
    script.type = "math/tex";
    script.text = dir === "rtl" ? `\\alwaysar{${latex}}` : latex;

    node.innerHTML = "";
    node.appendChild(script);

    return node;
  }

  static value(node: HTMLElement): string {
    return node.getAttribute("data-latex") || "";
  }
}

export default MathFormulaBlot;

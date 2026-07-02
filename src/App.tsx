import { useEffect, useRef, useState, useCallback } from "react";
import Quill from "quill";
import MathFormulaBlot from "./MathFormulaBolt";
import "quill/dist/quill.snow.css";
import "./App.css";

Quill.register("formats/formula", MathFormulaBlot);

declare global {
  interface Window {
    MathJax: any;
  }
}

const SIZES = [false, "10px", "12px", "14px", "18px", "24px", "36px"];
const FONTS = [false, "Poppins", "Tajawal", "Lato", "Arial"];

const Parchment = Quill.import("parchment") as any;
const StyleAttributor = Parchment.StyleAttributor || Parchment.Attributor.Style;

const SizeStyle = new StyleAttributor("size", "font-size", {
  scope: Parchment.Scope.INLINE,
  whitelist: SIZES,
});

const FontAttributor = new StyleAttributor("font", "font-family", {
  scope: Parchment.Scope.INLINE,
  whitelist: FONTS,
});

Quill.register(SizeStyle, true);
Quill.register(FontAttributor, true);

// ─── Math option definitions ───────────────────────────────────────────────
interface MathOption {
  id: string;
  labelEn: string;
  labelAr: string;
  latex: string;
  category: string;
}

const MATH_OPTIONS: MathOption[] = [
  // ── Trigonometry ──
  { id: "sin",      category: "Trigonometry",   labelEn: "sin",       labelAr: "جا",      latex: "\\sin" },
  { id: "cos",      category: "Trigonometry",   labelEn: "cos",       labelAr: "جتا",     latex: "\\cos" },
  { id: "tan",      category: "Trigonometry",   labelEn: "tan",       labelAr: "ظا",      latex: "\\tan" },
  { id: "cot",      category: "Trigonometry",   labelEn: "cot",       labelAr: "ظتا",     latex: "\\cot" },
  { id: "sec",      category: "Trigonometry",   labelEn: "sec",       labelAr: "قا",      latex: "\\sec" },

  // ── Fractions ──
  { id: "frac",     category: "Fractions",      labelEn: "a/b",       labelAr: "أ/ب",     latex: "\\frac{a}{b}" },
{
  id: "mixed",
  category: "Fractions",
  labelEn: "□³⁄₈",
  labelAr: "□³⁄₈",
  latex: "a\\frac{3}{8}"
},
// {
//   id: "rootfrac",
//   category: "Fractions",
//   labelEn: "√□/√□",
//   labelAr: "√□/√□",
//   latex: "\\frac{\\sqrt{6}}{\\sqrt{5}}"
// },
  // ── Powers & Roots ──
{
  id: "sqrt",
  category: "Powers & Roots",
  labelEn: "√□",
  labelAr: "√",
  latex: "\\sqrt{x}"
},
  { id: "power",    category: "Powers & Roots", labelEn: "xⁿ",        labelAr: "سⁿ",      latex: "x^{n}" },


  // ── Symbols ──
  { id: "times",    category: "Symbols",        labelEn: "×",         labelAr: "×",       latex: "\\times" },
  { id: "div",      category: "Symbols",        labelEn: "÷",         labelAr: "÷",       latex: "\\div" },
  { id: "leq",      category: "Symbols",        labelEn: "≤",         labelAr: "≤",       latex: "\\leq" },
  { id: "approx",   category: "Symbols",        labelEn: "≈",         labelAr: "≈",       latex: "\\approx" },
  { id: "abs",      category: "Symbols",        labelEn: "|x|",       labelAr: "|س|",     latex: "\\left|x\\right|" },
  { id: "pi",       category: "Symbols",        labelEn: "π",         labelAr: "π",       latex: "\\pi" },
  { id: "deg",      category: "Symbols",        labelEn: "°",         labelAr: "°",       latex: "^{\\circ}" },
  { id: "angle",    category: "Symbols",        labelEn: "∠",         labelAr: "∠",       latex: "\\angle" },
  { id: "triangle", category: "Symbols",        labelEn: "△",         labelAr: "△",       latex: "\\triangle" },
  { id: "cong",     category: "Symbols",        labelEn: "≅",         labelAr: "≅",       latex: "\\cong" },
  { id: "plus",     category: "Symbols", labelEn: "+", labelAr: "+", latex: "+" },
{ id: "minus",    category: "Symbols", labelEn: "-", labelAr: "-", latex: "-" },
{ id: "multiply", category: "Symbols", labelEn: "*", labelAr: "*", latex: "\\cdot" },
{ id: "divide",   category: "Symbols", labelEn: "/", labelAr: "/", latex: "/" },

  // ── Algebra──
  { id: "limit",    category: "Algebra",        labelEn: "lim",       labelAr: "نها",     latex: "\\lim_{x \\to a}" },
  { id: "sum",      category: "Algebra",        labelEn: "Σ",         labelAr: "Σ",       latex: "\\sum_{i=1}^{n} x_i" },
// {
//   id: "paren",
//   category: "Brackets",
//   labelEn: "( )",
//   labelAr: "( )",
//   latex: "\\left({}\\right)"
// },
// {
//   id: "brace",
//   category: "Brackets",
//   labelEn: "{ }",
//   labelAr: "{ }",
//   latex: "\\left\\{{}\\right\\}"
// },
// {
//   id: "bracket",
//   category: "Brackets",
//   labelEn: "[ ]",
//   labelAr: "[ ]",
//   latex: "\\left[{}\\right]"
// },


// Single Parentheses
{
  id: "lparen",
  category: "Brackets",
  labelEn: "(",
  labelAr: "(",
  latex: "("
},
{
  id: "rparen",
  category: "Brackets",
  labelEn: ")",
  labelAr: ")",
  latex: ")"
},

// Single Curly Braces
{
  id: "lbrace",
  category: "Brackets",
  labelEn: "{",
  labelAr: "{",
  latex: "\\{"
},
{
  id: "rbrace",
  category: "Brackets",
  labelEn: "}",
  labelAr: "}",
  latex: "\\}"
},

// Single Square Brackets
{
  id: "lbracket",
  category: "Brackets",
  labelEn: "[",
  labelAr: "[",
  latex: "["
},
{
  id: "rbracket",
  category: "Brackets",
  labelEn: "]",
  labelAr: "]",
  latex: "]"
},



// ── Geometry ──
{ id: "parallel",     category: "Geometry", labelEn: "∥",       labelAr: "∥",       latex: "\\parallel" },
{ id: "perpendicular",category: "Geometry", labelEn: "⊥",       labelAr: "⊥",       latex: "\\perp" },

// ── Variables ──
{ id: "varA", category: "Variables", labelEn: "A", labelAr: "أ", latex: "A" },
{ id: "varB", category: "Variables", labelEn: "B", labelAr: "ب", latex: "B" },
{ id: "varC", category: "Variables", labelEn: "C", labelAr: "ج", latex: "C" },

  // { id: "polypar",  category: "Algebra",        labelEn: "(ax²+…)",   labelAr: "(أس²+…)", latex: "(3x^{2}-5x+2)+(4x^{2}+x-3)" },
  // { id: "polyadv",  category: "Algebra",        labelEn: "ax²y⁴−…",  labelAr: "أس²ص⁴−…", latex: "36x^{2}y^{4}-18x^{3}y^{2}+24xy^{3}" },
];


// ─── Math Picker Modal ──────────────────────────────────────────────────────
interface MathPickerModalProps {
  initialLatex: string;
  initialIsArabic: boolean;
  isEditing: boolean;
  onInsert: (latex: string, isArabic: boolean) => void;
  onClose: () => void;
}

function MathPickerModal({
  initialLatex,
  initialIsArabic,
  isEditing,
  onInsert,
  onClose,
}: MathPickerModalProps) {
  const [latex, setLatex] = useState(isEditing ? initialLatex : "");
  const [isArabic, setIsArabic] = useState(isEditing ? initialIsArabic : false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = previewRef.current;
    if (!node) return;

    if (!latex.trim()) {
      node.innerHTML = "";
      return;
    }

    document.documentElement.lang = isArabic ? "ar" : "en";

    const tex = isArabic ? `\\alwaysar{${latex}}` : latex;

    node.innerHTML = "";
    node.className = "mp-preview ql-formula";
    node.setAttribute("dir", isArabic ? "rtl" : "ltr");

    const script = document.createElement("script");
    script.type = "math/tex";
    script.text = tex;
    node.appendChild(script);

    if (window.MathJax?.Hub) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, node]);
    }
  }, [latex, isArabic]);

  const handleOptionClick = (option: MathOption) => {
    setLatex((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${option.latex}` : option.latex;
    });
  };

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex.trim(), isArabic);
    }
  };

  const t = {
    title: isEditing
      ? isArabic ? "تعديل الصيغة" : "Edit Formula"
      : isArabic ? "محرر الصيغ" : "Visual Math Editor",
    hint: isArabic
      ? "اختر رمزًا أو اكتب صيغة LaTeX، ثم اضغط إدراج."
      : "Pick a symbol or type LaTeX directly, then click Insert.",
    preview: isArabic ? "المعاينة" : "Preview",
    placeholder: isArabic ? "اكتب صيغة LaTeX هنا…" : "Type LaTeX here…",
    insert: isEditing
      ? isArabic ? "تحديث الصيغة" : "Update Formula"
      : isArabic ? "إضافة معادلة" : "Add Equation",
    clear: isArabic ? "مسح" : "Clear",
  };

  const categories = Array.from(new Set(MATH_OPTIONS.map((o) => o.category)));

  return (
    <div
      className="vme-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="vme-modal" dir={isArabic ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="vme-header">
          <span className="vme-title">{t.title}</span>

          <div className="mp-lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={`mp-lang-btn ${!isArabic ? "mp-lang-btn--active" : ""}`}
              onClick={() => setIsArabic(false)}
              disabled={isEditing}
            >
              EN
            </button>
            <button
              type="button"
              className={`mp-lang-btn ${isArabic ? "mp-lang-btn--active" : ""}`}
              onClick={() => setIsArabic(true)}
              disabled={isEditing}
            >
              AR
            </button>
          </div>

          <button className="vme-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mp-body">
          {/* Grouped symbol grid — no category headings, no gaps */}
          <div className="mp-grid" role="group" aria-label="Math Symbols">
            {categories.map((cat) =>
              MATH_OPTIONS.filter((o) => o.category === cat).map((option) => (
                <button
                  key={option.id}
                  className="mp-option"
                  onClick={() => handleOptionClick(option)}
                  type="button"
                  title={isArabic ? option.labelAr : option.labelEn}
                >
                  {isArabic ? option.labelAr : option.labelEn}
                </button>
              ))
            )}
          </div>

          {/* LaTeX input */}
          <div className="mp-section">
            <label className="mp-label" htmlFor="mp-latex-input">
              LaTeX
            </label>
            <input
              id="mp-latex-input"
              className="vme-latex-input"
              type="text"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInsert()}
              placeholder={t.placeholder}
              spellCheck={false}
              dir="ltr"
            />
          </div>

          {/* Live render preview */}
          <div className="mp-section">
            <label className="mp-label">{t.preview}</label>
            <div
              className="mp-preview"
              dir={isArabic ? "rtl" : "ltr"}
              lang={isArabic ? "ar" : "en"}
              ref={previewRef}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="vme-footer">
          <div className="vme-footer-row">
            <button className="mp-clear-btn" onClick={() => setLatex("")} type="button">
              {t.clear}
            </button>
            <button className="vme-insert-btn" onClick={handleInsert} type="button">
              {t.insert}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
function App() {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [latex, setLatex] = useState("");
  const [isArabic, setIsArabic] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const editingIndexRef = useRef<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ font: FONTS }, { header: [] }, { size: SIZES }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }, { direction: "rtl" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link"],
          [{ color: [] }, { background: [] }],
          ["clean"],
        ],
      },
    });
  }, []);

  useEffect(() => {
    const root = editorRef.current;
    const quill = quillRef.current;
    if (!root) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const formulaNode = target.closest(".ql-formula") as HTMLElement | null;
      if (!formulaNode || !quill) return;

      const clickedLatex = formulaNode.getAttribute("data-latex") || "";
      const clickedDir = formulaNode.getAttribute("dir") || "ltr";

      const blot = Quill.find(formulaNode);
      if (!blot) return;
      const index = quill.getIndex(blot as any);

      editingIndexRef.current = index;
      setIsEditing(true);
      setLatex(clickedLatex);
      setIsArabic(clickedDir === "rtl");
      setShowPicker(true);
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, []);

  const insertFormulaImmediate = useCallback(
    (latexToInsert: string, langIsArabic: boolean) => {
      const quill = quillRef.current;
      if (!quill || !latexToInsert.trim()) return;

      document.documentElement.lang = langIsArabic ? "ar" : "en";

      const editIndex = editingIndexRef.current;
      let index: number;

      if (editIndex !== null) {
        quill.deleteText(editIndex, 1, "user");
        index = editIndex;
        editingIndexRef.current = null;
      } else {
        const range = quill.getSelection(true);
        index = range ? range.index : 0;
      }

      quill.insertEmbed(
        index,
        "formula",
        { latex: latexToInsert.trim(), dir: langIsArabic ? "rtl" : "ltr" },
        "user",
      );
      quill.setSelection(index + 1, 0);

      if (window.MathJax && langIsArabic) {
        const formulaNodes = editorRef.current?.querySelectorAll(
          '.ql-formula[dir="rtl"]',
        );
        const lastNode = formulaNodes?.[formulaNodes.length - 1];
        if (lastNode) {
          window.MathJax.Hub.Queue(
            ["Typeset", window.MathJax.Hub, lastNode],
            () => {
              const ARROW_CHARS = /[\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F]/;
              lastNode.querySelectorAll(".mjx-mo").forEach((mo) => {
                const text = mo.textContent || "";
                if (ARROW_CHARS.test(text)) {
                  (mo as HTMLElement).style.cssText +=
                    "transform: scaleX(-1) !important; display: inline-block !important;";
                }
              });
              lastNode.querySelectorAll(".mjx-surd").forEach((surd) => {
                const insideFrac = surd.closest(".mjx-mfrac");
                (surd as HTMLElement).style.paddingTop = insideFrac
                  ? "6px"
                  : "8.5px";
              });
            },
          );
        }
      } else if (window.MathJax) {
        const formulaNodes = editorRef.current?.querySelectorAll(
          '.ql-formula[dir="ltr"]',
        );
        const lastNode = formulaNodes?.[formulaNodes.length - 1];
        if (lastNode) {
          window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, lastNode]);
        }
      }
    },
    [],
  );

  const insertFormula = useCallback(() => {
    insertFormulaImmediate(latex, isArabic);
  }, [latex, isArabic, insertFormulaImmediate]);

  const handlePickerInsert = (latexFromPicker: string, pickerIsArabic: boolean) => {
    setLatex(latexFromPicker);
    setIsArabic(pickerIsArabic);
    setShowPicker(false);
    setIsEditing(false);
    insertFormulaImmediate(latexFromPicker, pickerIsArabic);
  };

  const handlePickerClose = () => {
    editingIndexRef.current = null;
    setIsEditing(false);
    setShowPicker(false);
  };

  const openPickerForNew = () => {
    editingIndexRef.current = null;
    setIsEditing(false);
    setShowPicker(true);
  };

  return (
    <div className="app">
      <h1>Arabic Quill + Custom VME POC</h1>

      <div className="controls">
        <input
          type="text"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="See LaTeX here…"
          onKeyDown={(e) => e.key === "Enter" && insertFormula()}
          disabled
        />

        <label className="toggle">
          <input
            type="checkbox"
            checked={isArabic}
            onChange={(e) => setIsArabic(e.target.checked)}
          />
        </label>

        <button className="btn-visual" onClick={openPickerForNew}>
          🧮 Math Editor
        </button>
      </div>

      <div className="editor-wrapper">
        <div ref={editorRef} />
      </div>

      {showPicker && (
        <MathPickerModal
          initialLatex={latex}
          initialIsArabic={isArabic}
          isEditing={isEditing}
          onInsert={handlePickerInsert}
          onClose={handlePickerClose}
        />
      )}
    </div>
  );
}

export default App;

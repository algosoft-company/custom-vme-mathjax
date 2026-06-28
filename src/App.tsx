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
}

const MATH_OPTIONS: MathOption[] = [
  { id: "sin", labelEn: "sin", labelAr: "جا", latex: "\\sin" },
  { id: "cos", labelEn: "cos", labelAr: "جتا", latex: "\\cos" },
  { id: "tan", labelEn: "tan", labelAr: "ظا", latex: "\\tan" },
  { id: "cot", labelEn: "cot", labelAr: "ظتا", latex: "\\cot" },
  { id: "sec", labelEn: "sec", labelAr: "قا", latex: "\\sec" },
  { id: "sqrt", labelEn: "√ Square root", labelAr: "√ جذر تربيعي", latex: "\\sqrt{x}" },
{ id: "limit", labelEn: "lim Limit", labelAr: "نها Limit", latex: "\\lim_{x \\to a}" },
  { id: "power", labelEn: "xⁿ Power", labelAr: "xⁿ أس", latex: "x^{n}" },
  { id: "sum", labelEn: "Σ Sum", labelAr: "Σ مجموع", latex: "\\sum_{i=1}^{n} x_i" },
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
  const [latex, setLatex] = useState(initialLatex);
  const [isArabic, setIsArabic] = useState(initialIsArabic);
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
    node.className = `mp-preview ql-formula${isArabic ? "" : ""}`;
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
      : isArabic ? "محرر الصيغ" : "Math Editor",
    hint: isArabic
      ? "اختر رمزًا أو اكتب صيغة LaTeX، ثم اضغط إدراج."
      : "Pick a symbol or type LaTeX directly, then click Insert.",
    preview: isArabic ? "المعاينة" : "Preview",
    placeholder: isArabic ? "اكتب صيغة LaTeX هنا…" : "Type LaTeX here…",
    insert: isEditing
      ? isArabic ? "تحديث الصيغة" : "Update Formula"
      : isArabic ? "إدراج الصيغة" : "Add Equation",
    clear: isArabic ? "مسح" : "Clear",
    ar: "AR",
    en: "EN",
  };

  return (
    <div
      className="vme-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="vme-modal" dir={isArabic ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="vme-header">
          <span className="vme-title">{t.title}</span>

          {/* AR / EN switch lives right here in the modal header */}
          <div className="mp-lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={`mp-lang-btn ${!isArabic ? "mp-lang-btn--active" : ""}`}
              onClick={() => setIsArabic(false)}
            >
              {t.en}
            </button>
            <button
              type="button"
              className={`mp-lang-btn ${isArabic ? "mp-lang-btn--active" : ""}`}
              onClick={() => setIsArabic(true)}
            >
              {t.ar}
            </button>
          </div>

          <button className="vme-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mp-body">
          {/* Symbol grid */}
          <div className="mp-hint">{t.hint}</div>
          <div className="mp-grid">
            {MATH_OPTIONS.map((option) => (
              <button
                key={option.id}
                className="mp-option"
                onClick={() => handleOptionClick(option)}
                type="button"
              >
                {isArabic ? option.labelAr : option.labelEn}
              </button>
            ))}
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
            <button
              className="mp-clear-btn"
              onClick={() => setLatex("")}
              type="button"
            >
              {t.clear}
            </button>
            <button
              className="vme-insert-btn"
              onClick={handleInsert}
              type="button"
            >
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

  // When editing an existing formula, this holds its index in the Quill
  // document so Insert can replace it in place instead of inserting new.
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

  // ── Click-to-edit: listen for clicks on existing .ql-formula embeds ──────
  useEffect(() => {
    const root = editorRef.current;
    const quill = quillRef.current;
    if (!root) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const formulaNode = target.closest(".ql-formula") as HTMLElement | null;
      if (!formulaNode || !quill) return;

      // Read the stored latex straight off the DOM node (data-latex is set
      // by MathFormulaBlot.create), same value MathFormulaBlot.value() reads.
      const clickedLatex = formulaNode.getAttribute("data-latex") || "";
      const clickedDir = formulaNode.getAttribute("dir") || "ltr";

      // Find this blot's index in the Quill document so we know what to
      // replace on update.
      const blot = Quill.find(formulaNode);
      if (!blot) return;
      const index = quill.getIndex(blot);

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
        // Editing: remove the old embed (length 1) and insert the new one
        // at the same position, so it replaces in place.
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
      <h1>Arabic Quill + MathJax POC</h1>

      <div className="controls">
        <input
          type="text"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="Enter LaTeX e.g. \frac{a+b}{c}"
          onKeyDown={(e) => e.key === "Enter" && insertFormula()}
        />

        <label className="toggle">
          <input
            type="checkbox"
            checked={isArabic}
            onChange={(e) => setIsArabic(e.target.checked)}
          />
          <span className="slider" />
          <span className="label">{isArabic ? "Arabic" : "English"}</span>
        </label>

        <button onClick={insertFormula}>Insert Formula</button>

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
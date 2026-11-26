"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Columns2, Copy, Monitor, Smartphone } from "lucide-react";
import styles from "./studio.module.css";

const concepts = {
  executive: "Executive briefing",
  digest: "Deal digest",
  research: "Research bulletin",
} as const;

type Concept = keyof typeof concepts;
const layoutNotes: Record<Concept, string> = {
  executive: "Our starting point for a client note. The week’s themes and the lead transaction in each sector get the most space.",
  digest: "Compact deal entries and shaded sector headings make it easy to scan for a sponsor, asset or market.",
  research: "A serif masthead and prominent sector headings suit readers working through the briefing in depth.",
};
type StudioProps = {
  editions: string[];
  edition: string;
  layouts: Record<Concept | "original", string>;
  initialLayout: Concept;
  initialView?: "phone" | "desktop";
  initialCompare: boolean;
};

const editionDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const blockTags = new Set(["ARTICLE", "DIV", "H1", "H2", "H3", "H4", "LI", "P", "SECTION", "TABLE", "TR"]);

// Preserve source destinations and row boundaries when the receiving app chooses plain text.
function readableText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").replace(/\s+/g, " ");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const element = node as HTMLElement;
  const tag = element.tagName;
  if (element.hidden || element.style.display === "none" || element.getAttribute("aria-hidden") === "true" || ["STYLE", "SCRIPT", "NOSCRIPT"].includes(tag)) return "";
  if (tag === "BR") return "\n";
  if (tag === "IMG") return element.getAttribute("alt") || "";
  const text = Array.from(element.childNodes, readableText).join("");
  if (tag === "A") {
    const url = element.getAttribute("href");
    const label = text.trim();
    return url && url !== label ? (label ? `${label} (${url})` : url) : label;
  }
  if (tag === "TD" || tag === "TH") return text + "\t";
  return blockTags.has(tag) ? `\n${text}\n` : text;
}

function emailClipboard(root: HTMLElement) {
  return {
    html: root.innerHTML,
    text: readableText(root)
      .replace(/ *\t[ \t]*/g, "\t")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  };
}

function selectForManualCopy(frame: HTMLIFrameElement, root: HTMLElement, payload: ReturnType<typeof emailClipboard>) {
  const doc = root.ownerDocument;
  const selection = doc.getSelection();
  if (!selection) return false;
  const range = doc.createRange();
  range.selectNodeContents(root);
  frame.focus();
  selection.removeAllRanges();
  selection.addRange(range);
  doc.oncopy = event => {
    doc.oncopy = null;
    if (!selection.rangeCount || !event.clipboardData) return;
    const active = selection.getRangeAt(0);
    if (active.compareBoundaryPoints(Range.START_TO_START, range) || active.compareBoundaryPoints(Range.END_TO_END, range)) return;
    event.clipboardData.setData("text/html", payload.html);
    event.clipboardData.setData("text/plain", payload.text);
    event.preventDefault();
  };
  return true;
}

function Preview({ title, fragment, width, frameRef }: {
  title: string;
  fragment: string;
  width: number;
  frameRef?: RefObject<HTMLIFrameElement>;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const element = canvas.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const update = () => setScale(Math.min(1, element.clientWidth / width) || 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  const source = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"></head><body style="margin:0;background:#fff"><main id="email-content">${fragment}</main></body></html>`;
  return (
    <figure className={styles.preview}>
      <figcaption>{title}</figcaption>
      <div className={styles.previewWell}>
        <div ref={canvas} className={styles.canvas} style={{ maxWidth: width }}>
          <iframe ref={frameRef} title={`${title} email preview`} srcDoc={source}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width, height: `${100 / scale}%`, transform: `scale(${scale})` }} />
        </div>
      </div>
    </figure>
  );
}

export default function EmailStudio({ editions, edition, layouts, initialLayout, initialView, initialCompare }: StudioProps) {
  const [concept, setConcept] = useState<Concept>(initialLayout);
  const [compare, setCompare] = useState(initialCompare);
  const [phone, setPhone] = useState(initialView === "phone");
  const [notice, setNotice] = useState({ issueLayout: "", text: "" });
  const selectedFrame = useRef<HTMLIFrameElement>(null);
  const issueLayout = `${edition}-${concept}`;
  const width = phone ? 375 : 600;

  useEffect(() => {
    if (!initialView && window.matchMedia?.("(max-width: 620px)").matches) setPhone(true);
  }, [initialView]);

  async function copy() {
    const frame = selectedFrame.current;
    const root = frame?.contentDocument?.getElementById("email-content");
    if (!frame || !root) {
      setNotice({ issueLayout, text: "The preview is loading. Try copying again in a moment." });
      return;
    }
    const payload = emailClipboard(root);
    try {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([payload.html], { type: "text/html" }),
        "text/plain": new Blob([payload.text], { type: "text/plain" }),
      })]);
      setNotice({ issueLayout, text: "Copied. Paste into a new HTML message in Outlook." });
    } catch {
      if (frame !== selectedFrame.current) return;
      const selected = selectForManualCopy(frame, root, payload);
      setNotice({ issueLayout, text: selected
        ? "Email selected. Press Ctrl+C or ⌘C to copy, then paste into Outlook."
        : "Select the email inside its preview, copy it, then paste into Outlook." });
    }
  }

  return (
    <section id="email-studio" className={styles.studio} aria-labelledby="studio-title">
      <div className={styles.sectionHead}>
        <h2 id="studio-title">Preview &amp; copy</h2>
        <form method="get" action="/one-off-requests/email-design-gallery#email-studio">
          <label className={styles.edition}>
            Published edition
            <select name="edition" defaultValue={edition} onChange={event => event.currentTarget.form?.requestSubmit()}>
              {editions.map(date => <option key={date} value={date}>{editionDate.format(new Date(`${date}T12:00:00Z`))}</option>)}
            </select>
          </label>
          <input type="hidden" name="layout" value={concept} />
          <input type="hidden" name="view" value={phone ? "phone" : "desktop"} />
          {compare && <input type="hidden" name="compare" value="1" />}
          <noscript><button type="submit">Open edition</button></noscript>
        </form>
      </div>

      <fieldset className={styles.concepts}>
        <legend className={styles.srOnly}>Email layout</legend>
        {(Object.entries(concepts) as [Concept, string][]).map(([value, label]) => (
          <label key={value}>
            <input type="radio" name="email-layout" value={value} checked={concept === value}
              onChange={() => { setConcept(value); setNotice({ issueLayout: "", text: "" }); }} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <p className={styles.layoutNote} aria-live="polite">{layoutNotes[concept]}</p>

      <div className={styles.toolbar}>
        <div className={styles.viewTools}>
          <div className={styles.devices} role="group" aria-label="Preview width">
            <button type="button" aria-pressed={!phone} onClick={() => setPhone(false)}><Monitor size={15} aria-hidden />Desktop</button>
            <button type="button" aria-pressed={phone} onClick={() => setPhone(true)}><Smartphone size={15} aria-hidden />Phone</button>
          </div>
          <button type="button" className={styles.compare} aria-pressed={compare} onClick={() => setCompare(!compare)}>
            <Columns2 size={15} aria-hidden />Compare original
          </button>
        </div>
        <button type="button" className={styles.copy} onClick={copy}><Copy size={15} aria-hidden />Copy for Outlook</button>
      </div>
      <p className={styles.instructions} role="status">
        {notice.issueLayout === issueLayout ? notice.text : "Paste into a new HTML message in Outlook. Choose Keep Source Formatting if prompted."}
      </p>
      <div className={compare ? styles.pair : styles.single}>
        <Preview key={issueLayout} title={concepts[concept]} fragment={layouts[concept]} width={width} frameRef={selectedFrame} />
        {compare && <Preview title="Published original" fragment={layouts.original} width={width} />}
      </div>
      <p className={styles.footnote}>Browser previews. Appearance in a received Outlook message still needs an inbox test.</p>
    </section>
  );
}

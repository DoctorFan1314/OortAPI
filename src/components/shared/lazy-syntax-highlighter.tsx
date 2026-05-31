"use client";

import { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import md from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import { codeTheme, lightCodeTheme } from "./markdown-renderer";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import go from "react-syntax-highlighter/dist/esm/languages/hljs/go";
import rust from "react-syntax-highlighter/dist/esm/languages/hljs/rust";

SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", md);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("shell", bash);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("html", html);
SyntaxHighlighter.registerLanguage("xml", html);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("rust", rust);

interface LazySyntaxHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export default function LazySyntaxHighlighter({ code, language, showLineNumbers = false, highlightLines }: LazySyntaxHighlighterProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const selectedTheme = isDark ? codeTheme : lightCodeTheme;

  const lineProps = (lineNumber: number) => {
    const style: React.CSSProperties = {};
    if (highlightLines?.includes(lineNumber)) {
      style.backgroundColor = isDark ? "rgba(0, 212, 255, 0.06)" : "rgba(8, 145, 178, 0.06)";
      style.display = "block";
    }
    return { style };
  };

  return (
    <SyntaxHighlighter
      language={language || "text"}
      style={selectedTheme}
      customStyle={{ margin: 0, fontSize: "0.875rem" }}
      showLineNumbers={showLineNumbers}
      lineNumberStyle={{ minWidth: "2.5em", paddingRight: "1em", opacity: 0.4, textAlign: "right", userSelect: "none" }}
      lineProps={lineProps}
    >
      {code}
    </SyntaxHighlighter>
  );
}

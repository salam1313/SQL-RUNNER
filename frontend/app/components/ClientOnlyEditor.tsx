"use client";
import React from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("react-simple-code-editor"), { ssr: false });

// Prism must be required dynamically to avoid SSR issues
let Prism: any = null;
if (typeof window !== "undefined") {
  Prism = require("prismjs");
  require("prismjs/components/prism-sql");
  require("prismjs/themes/prism.css");
}

export default function ClientOnlyEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  if (!Editor || !Prism) return null;
  return (
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={code => Prism.highlight(code, Prism.languages.sql, "sql")}
      padding={12}
      style={{
        fontFamily: "Fira Mono, monospace",
        fontSize: 15,
        minHeight: 90,
        outline: "none",
        background: "inherit",
        color: "#222",
      }}
      textareaId="sql-editor"
      placeholder="Type your SQL query here..."
    />
  );
}

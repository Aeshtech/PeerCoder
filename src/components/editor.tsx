"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import CodeMirror from "@uiw/react-codemirror";
// import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import {
  abcdef,
  androidstudio,
  xcodeDark,
  githubDark,
  bbedit,
  githubLight,
  basicLight,
  atomone,
} from "@uiw/codemirror-themes-all";

export type LanguageType = "java" | "python" | "c" | "cpp";
export type ThemeType =
  | "abcdef"
  | "atomone"
  | "androidstudio"
  | "xcodeDark"
  | "bbedit"
  | "githubLight"
  | "githubDark"
  | "basicLight";

const languages = {
  python: python(),
  java: java(),
  c: cpp(),
  cpp: cpp(),
  // javascript: javascript(),
};
const themes = {
  abcdef,
  atomone,
  androidstudio,
  xcodeDark,
  githubDark,
  bbedit,
  githubLight,
  basicLight,
};

import { useEffect, useState } from "react";
import EditorToolbar from "./editor-toolbar";
import {
  defaultCCode,
  defaultCPPCode,
  defaultJavaCode,
  defaultPythonCode,
} from "../utils/defaults";

const Editor = () => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageType>("java");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("githubDark");
  const [executionInProgress, setExecutionInProgress] = useState(false);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const extensionLanguage = (languages as any)[selectedLanguage];
  const extensionTheme = (themes as any)[selectedTheme];

  useEffect(() => {
    let flag = true;
    if (flag) {
      if (selectedLanguage === "java") {
        setCode(defaultJavaCode);
      } else if (selectedLanguage === "python") {
        setCode(defaultPythonCode);
      } else if (selectedLanguage === "c") {
        setCode(defaultCCode);
      } else if (selectedLanguage === "cpp") {
        setCode(defaultCPPCode);
      }
    }

    return () => {
      flag = false;
    };
  }, [selectedLanguage]);

  const handleRunClick = async () => {
    setExecutionInProgress(true);
    const body = {
      source_code: code,
      language: selectedLanguage,
      input,
      api_key: "guest",
    };

    const res = await fetch(`https://api.paiza.io/runners/create`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Something went wrong, status ${res.status}`);
    }

    const data = await res.json();
    const query = new URLSearchParams({
      id: data?.id,
      api_key: "guest",
    });
    var callback = (data: any, error: any) => {
      setExecutionInProgress(false);
      if (error) {
        console.error(error);
        return;
      }
      let output = "";
      if (data.stdout) output += data.stdout;
      if (data.stderr) output += data.stderr;
      if (data.build_stderr) output += data.build_stderr;
      setOutput(output);
    };

    request(10, callback);
    function request(
      retries: number,
      callback: (data: any, error: any) => void
    ) {
      fetch(`https://api.paiza.io/runners/get_details?${query.toString()}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // request successful

          if (data.status === "completed") {
            // server done, deliver data to script to consume
            callback(data, false);
          } else {
            if (retries > 0) {
              request(--retries, callback);
            } else {
              // no retries left, calling callback with error
              callback([], "out of retries");
            }
          }
        })
        .catch((error) => {
          if (retries > 0) {
            request(--retries, callback);
          } else {
            callback([], error);
          }
        });
    }
  };

  return (
    <div>
      <EditorToolbar
        config={{
          selectedLanguage,
          selectedTheme,
          executionInProgress,
          setSelectedLanguage,
          setSelectedTheme,
          handleRunClick,
        }}
      />
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel className="min-h-[70vh]" minSize={50}>
          <CodeMirror
            value={code}
            onChange={(value: any) => setCode(value)}
            extensions={[extensionLanguage]} // Use the appropriate language extension
            theme={extensionTheme} // Optional: Set a theme (see available themes)
            height="70vh" // Optional: Set height
          />
        </Panel>
        <PanelResizeHandle className="bg-transparent w-[3px]" />
        <Panel minSize={25} defaultSize={30}>
          <PanelGroup autoSaveId="example" direction="vertical">
            <Panel minSize={25}>
              <CodeMirror
                placeholder={"Enter your input values, one per line, if any"}
                value={input}
                onChange={(value: any) => setInput(value)}
                extensions={[]} // Use the appropriate language extension
                theme={extensionTheme} // Optional: Set a theme (see available themes)
                height="400px" // Optional: Set height
              />
            </Panel>
            <PanelResizeHandle className="bg-transparent h-[3px]" />
            <Panel minSize={25}>
              <CodeMirror
                placeholder={"Output will be print here"}
                readOnly
                value={output}
                extensions={[]} // Use the appropriate language extension
                theme={extensionTheme} // Optional: Set a theme (see available themes)
                height="400px" // Optional: Set height
              />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default Editor;

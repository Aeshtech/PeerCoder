"use client";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
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
import EditorToolbar from "./editor-toolbar";
import {
  defaultCCode,
  defaultCPPCode,
  defaultJavaCode,
  defaultPythonCode,
  defaultJSCode
} from "../utils/defaults";
import {
  debounce,
  deleteLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from "../utils/helpers";
import toast from "react-hot-toast";
import { javascript } from "@codemirror/lang-javascript";

export type LanguageType = "java" | "python" | "c" | "cpp" | "javascript";
export type ThemeType =
  | "abcdef"
  | "atomone"
  | "androidstudio"
  | "xcodeDark"
  | "bbedit"
  | "githubLight"
  | "githubDark"
  | "basicLight";

interface PayloadForNewUser {
  code: string;
  input: string;
  output: string;
  selectedLanguage: LanguageType;
}
const languages = {
  python: python(),
  java: java(),
  c: cpp(),
  cpp: cpp(),
  javascript: javascript(),
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

const Editor = ({ socket }: { socket: Socket }) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageType>("java");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("githubDark");
  const [executionInProgress, setExecutionInProgress] = useState(false);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const extensionLanguage = (languages as any)[selectedLanguage];
  const extensionTheme = (themes as any)[selectedTheme];
  const setLocalStorageDebounced = useRef(debounce(setLocalStorage, 300));
  const [isReceivingCode, setIsReceivingCode] = useState(false);

  useEffect(() => {
    let flag = true;
    if (flag) {
      const localStoredInput = getLocalStorage("input");
      const localStoredLanguage = getLocalStorage("selectedLanguage");
      if (localStoredInput) setInput(localStoredInput);
      if (localStoredLanguage)
        setSelectedLanguage(localStoredLanguage as LanguageType);
    }
    return () => {
      flag = false;
    };
  }, []);

  useEffect(() => {
    let flag = true;
    if (flag) {
      const localStoredLanguage = getLocalStorage("selectedLanguage");
      if (localStoredLanguage)
        setSelectedLanguage(localStoredLanguage as LanguageType);
      const localStoredCode = getLocalStorage("code");
      if (localStoredCode) {
        setCode(localStoredCode);
      } else {
        switch (selectedLanguage) {
          case "java":
            setCode(defaultJavaCode);
            break;
          case "cpp":
            setCode(defaultCPPCode);
            break;
          case "c":
            setCode(defaultCCode);
            break;
          case "python":
            setCode(defaultPythonCode);
            break;
          case "javascript":
            setCode(defaultJSCode);
            break;
        }
      }
    }
    return () => {
      flag = false;
    };
  }, [selectedLanguage]);

  //----------editor related listenres-----------

  // Set up socket event listener when the component mounts

  useEffect(() => {
    const handleSendDatatoNewUser = () => {
      const data: PayloadForNewUser = {
        code: code,
        input: input,
        output: output,
        selectedLanguage: selectedLanguage,
      };
      socket.emit("data-for-new-user", data);
    };
    socket.on("receive code", handleReceiveCode);
    socket.on("receive input", handleReceiveInput);
    socket.on("receive output", handleReceiveOutput);
    socket.on("mode-change-receive", handleRecieveModeChange);
    socket.on("receive-data-for-new-user", handleRecieveStatesFromSockets);
    socket.on("user-connected", handleSendDatatoNewUser);

    return () => {
      socket.off("receive code", handleReceiveCode);
      socket.off("receive input", handleReceiveInput);
      socket.off("receive output", handleReceiveOutput);
      socket.off("mode-change-receive", handleRecieveModeChange);
      socket.off("receive-data-for-new-user", handleRecieveStatesFromSockets);
      socket.off("user-connected", handleSendDatatoNewUser);
    };
  }, [code, input, output, selectedLanguage, socket]);

  // ------------------handlers--------------------

  const handleReceiveCode = (payload: string) => {
    setIsReceivingCode(true); // Set flag to true when receiving code
    setLocalStorageDebounced.current("code", payload);
    setCode(payload);
    setIsReceivingCode(false); // Reset flag after processing
  };

  const handleReceiveInput = (payload: string) => {
    setLocalStorageDebounced.current("input", payload);
    setInput(payload);
  };

  const handleReceiveOutput = (payload: string) => {
    setLocalStorage("output", payload);
    setOutput(payload);
  };

  const handleRecieveStatesFromSockets = (payload: PayloadForNewUser) => {
    const { code, input, output, selectedLanguage } = payload;
    setInput(input);
    setOutput(output);
    setCode(code);
    setSelectedLanguage(selectedLanguage);
    setLocalStorage("code", code);
    setLocalStorage("input", input);
    setLocalStorage("output", output);
    setLocalStorage("selectedLanguage", selectedLanguage);
  };

  const handleRecieveModeChange = (payload: LanguageType) => {
    setLocalStorage("selectedLanguage", payload);
    setSelectedLanguage(payload);
  };

  const handleChangeCode = (value: string) => {
    if (!isReceivingCode) {
      // Only run if not receiving code just to prevent conflicts
      setCode(value);
      setLocalStorageDebounced.current("code", value);
      socket.emit("code change", value);
    } else {
      toast.error("Only one user can type at a time", { id: "code-change" });
    }
  };
  const handleChangeInput = (value: string) => {
    setInput(value);
    setLocalStorageDebounced.current("input", value);
    socket.emit("input change", value);
  };
  const handleChangeOutput = (value: string) => {
    setOutput(value);
    setLocalStorage("output", value);
    socket.emit("output change", value);
  };
  const handleChangeLanguage = (value: LanguageType) => {
    setSelectedLanguage(value);
    setLocalStorage("selectedLanguage", value);
    socket.emit("mode-change-send", value);
  };

  const resetEditorForMe = () => {
    setCode(defaultJavaCode), setInput(""), setOutput("");
    setSelectedTheme("githubDark");
    setSelectedLanguage("java");
    deleteLocalStorage("code");
    deleteLocalStorage("input");
    deleteLocalStorage("output");
    deleteLocalStorage("selectedLanguage");
  };

  const handleRunClick = async () => {
    setExecutionInProgress(true);
    // runtimes that supported by piston api platform 
    const langRuntimeVersions = {
      python: { version: "3.10.0"},
      java: {
        version: "15.0.2",
      },
      c: {
        version: "10.2.0",
      },
      cpp: {
        version: "10.2.0",
      },
      javascript:{
        version: "18.15.0"
      }
    };
    const { version } = langRuntimeVersions[selectedLanguage];
  
    // API Request Payload
    const requestBody = {
      language: selectedLanguage,
      version,
      files: [{ name: `main.${selectedLanguage === "python" ? "py" : selectedLanguage === "javascript" ? "js" : selectedLanguage}`, content: code }],
    };
  
    try {
      // Call Piston API
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      // Handle API response
      const result = await response.json();
      if (!response.ok) throw new Error(`API Error: ${result.error || "Unknown error"}`);
  
      // Return output or error
      let output = "";
      if (result?.run?.stdout) output += result.run.stdout.trim() || null;
      if (result?.run?.stderr) output += result.run.stderr.trim() || null;
      if (result?.run?.signal){
        toast.error("Error: SIGKILL, Please try to run the code again");
      };
      setOutput(output);
      handleChangeOutput(output);
    } catch (error : any) {
      console.error(`❌ Execution failed:`, error);
    }finally{
      setExecutionInProgress(false);
    }
  }

  return (
    <div>
      <EditorToolbar
        config={{
          selectedLanguage,
          selectedTheme,
          executionInProgress,
          setSelectedLanguage: handleChangeLanguage,
          setSelectedTheme,
          handleRunClick,
          resetEditorForMe,
        }}
      />
      <PanelGroup autoSaveId="example" direction="horizontal">
        <Panel className="min-h-[70vh]" minSize={50}>
          <CodeMirror
            value={code}
            onChange={(value: any) => handleChangeCode(value)}
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
                onChange={(value: any) => handleChangeInput(value)}
                extensions={[]}
                theme={extensionTheme}
                height="400px"
              />
            </Panel>
            <PanelResizeHandle className="bg-transparent h-[3px]" />
            <Panel minSize={25}>
              <CodeMirror
                placeholder={"Output will be print here"}
                readOnly
                value={output}
                extensions={[]} // Use the appropriate language extension
                theme={extensionTheme}
                height="400px"
              />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default Editor;

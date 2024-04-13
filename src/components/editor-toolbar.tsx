import { LanguageType, ThemeType } from "./editor";
export interface EditorToolbarType {
  selectedLanguage: LanguageType;
  setSelectedLanguage: (value: LanguageType) => void;
  selectedTheme: ThemeType;
  setSelectedTheme: (value: ThemeType) => void;
  handleRunClick: () => void;
  executionInProgress?: boolean;
  resetEditorForMe: () => void;
}

const EditorToolbar = ({ config }: { config: EditorToolbarType }) => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    selectedTheme,
    setSelectedTheme,
    handleRunClick,
    executionInProgress,
    resetEditorForMe,
  } = config;
  return (
    <div className="h-[50px] border-b-[1px] border-[#ffffff1f] flex items-center justify-between px-[30px]">
      <div className="flex gap-x-[20px]">
        <select
          title="Select Programming Language"
          value={selectedLanguage}
          onChange={(e: any) =>
            setSelectedLanguage(e.target.value as LanguageType)
          }
          className="text-white min-w-[140px] px-[5px] h-[35px] rounded-[5px] outline-none cursor-pointer border-[1px] bg-[#ffffff1f]"
        >
          <option value="java">Programming Language</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          {/* <option value="javascript">JavaScript</option> */}
        </select>
        <select
          title="Select Editor Theme"
          value={selectedTheme}
          onChange={(e: any) => setSelectedTheme(e.target.value as ThemeType)}
          className="text-white min-w-[140px] px-[5px] h-[35px] rounded-[5px] outline-none cursor-pointer border-[1px] bg-[#ffffff1f]"
        >
          <option value="githubDark">Select Editor Theme</option>
          <option value="atomone">Atom One</option>
          <option value="androidstudio">Android Studio</option>
          <option value="basicLight">Basic Light</option>
          <option value="bbedit">Bbedit</option>
          <option value="githubLight">Github Light</option>
          <option value="githubDark">Github Dark</option>
          <option value="xcodeDark">X Code Dark</option>
        </select>
        <button
          title="Reset code only for me"
          onClick={() => {
            const res = window.confirm(
              "Are you sure reset your editor ? Note: This will erase all your code only for you."
            );
            if (res) resetEditorForMe();
          }}
          className="codeRunBtn border-[1px] bg-[#ffffff1f] text-white rounded-[5px] outline-none flex-center px-[10px] h-[35px] active:scale-[0.97]"
        >
          Reset My Editor
        </button>
      </div>
      <div>
        <button
          title="Run the Code"
          onClick={handleRunClick}
          disabled={executionInProgress}
          className={`codeRunBtn border-[1px] bg-[#ffffff1f] text-white rounded-[5px] outline-none flex-center px-[10px] h-[35px] active:scale-[0.97] ${
            executionInProgress && "cursor-not-allowed"
          }`}
        >
          {!executionInProgress ? "Run the Code" : "Executing..."}
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;

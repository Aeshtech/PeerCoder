import { LanguageType, ThemeType } from "./editor";
export interface EditorToolbarType {
  selectedLanguage: LanguageType;
  setSelectedLanguage: (value: LanguageType) => void;
  selectedTheme: ThemeType;
  setSelectedTheme: (value: ThemeType) => void;
  handleRunClick: () => void;
  executionInProgress?: boolean;
}

const EditorToolbar = ({ config }: { config: EditorToolbarType }) => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    selectedTheme,
    setSelectedTheme,
    handleRunClick,
    executionInProgress,
  } = config;
  return (
    <div className="h-[50px] border-b-[1px] border-[#ffffff1f] flex items-center justify-between px-[30px]">
      <div>
        <select
          value={selectedLanguage}
          onChange={(e: any) =>
            setSelectedLanguage(e.target.value as LanguageType)
          }
          className="bg-transparent text-white min-w-[140px] h-[35px] rounded-[5px] outline-none cursor-pointer border-[1px] border-[#ffffff1f]"
        >
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          {/* <option value="javascript">JavaScript</option> */}
        </select>
        <select
          value={selectedTheme}
          onChange={(e: any) => setSelectedTheme(e.target.value as ThemeType)}
          className="bg-transparent text-white min-w-[140px] h-[35px] rounded-[5px] outline-none cursor-pointer ml-[20px] border-[1px] border-[#ffffff1f]"
        >
          <option value="abcdef">Abcdef</option>
          <option value="atomone">Atom One</option>
          <option value="androidstudio">Android Studio</option>
          <option value="basicLight">Basic Light</option>
          <option value="bbedit">Bbedit</option>
          <option value="githubLight">Github Light</option>
          <option value="githubDark">Github Dark</option>
          <option value="xcodeDark">X Code Dark</option>
        </select>
      </div>
      <div>
        <button
          onClick={handleRunClick}
          disabled={executionInProgress}
          className={`border-[1px] bg-indigo-700 text-white flex-center px-[10px] h-[30px] ${
            executionInProgress && "cursor-not-allowed"
          }`}
        >
          {!executionInProgress ? "Run the Code" : "Running..."}
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;

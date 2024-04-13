import { useState } from "react";
import {
  CameraOffSVG,
  CameraOnSVG,
  EditSVG,
  MicOffSVG,
  MicOnSVG,
} from "./svg-icons";
import { writeClipboardText } from "../utils/helpers";

const Header = ({
  userName,
  myPeerId,
  handleVideoToggle,
  handleAudioToggle,
  setIsModalOpen,
  handleEndCall,
}: {
  userName: string;
  myPeerId: string;
  handleVideoToggle: (userId: string) => void;
  handleAudioToggle: (userId: string) => void;
  setIsModalOpen: (value: boolean) => void;
  handleEndCall: () => void;
}) => {
  const [isCameraOn, setCameraOn] = useState(true);
  const [isMicOn, setMicOn] = useState(true);

  return (
    <header
      className="h-[50px] flex items-center justify-between px-20 w-full border-[1px] border-[#ffffff1f] rounded-t-[10px]"
      style={{
        boxShadow: "inset 2px 2px 10px #  050505ba",
      }}
    >
      <div>
        <h1 className="logo text-blackWhite text-2xl text-white">PeerCoder</h1>
      </div>
      <div className="flex items-center gap-x-[15px]">
        <button
          title="Toggle Mic"
          className={`w-[40px] h-[40px] rounded-full flex-center border-[1px] border-[#ffffff1f] ${
            !isMicOn && "bg-[#8b0000]"
          }`}
          style={{
            boxShadow: "inset 2px 2px 10px #050505ba",
          }}
          onClick={() => {
            handleAudioToggle(myPeerId);
            setMicOn((prev) => !prev);
          }}
        >
          {isMicOn ? <MicOnSVG fill="white" /> : <MicOffSVG fill="white" />}
        </button>
        <button
          title="Toggle Camera"
          className={`w-[40px] h-[40px] ml-[10px] rounded-full flex-center border-[1px] border-[#ffffff1f] ${
            !isCameraOn && "bg-[#8b0000]"
          }`}
          style={{
            boxShadow: "inset 2px 2px 10px #050505ba",
          }}
          onClick={() => {
            handleVideoToggle(myPeerId);
            setCameraOn((prev) => !prev);
          }}
        >
          {isCameraOn ? (
            <CameraOnSVG fill="white" />
          ) : (
            <CameraOffSVG fill="white" />
          )}
        </button>
        <div className="flex gap-x-[7px] overflow-hidden w-[170px]">
          <h5 className="text-white truncate">{userName}</h5>
          <button
            title="Update Name"
            className="h-7 w-7 rounded-full hover:bg-gray-500 flex-center shrink-0"
            onClick={() => setIsModalOpen(true)}
          >
            <EditSVG className="text-white w-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-x-[20px]">
        <button
          title="Copy and share the URL to invite in the room"
          className="px-[10px] py-[5px] text-white flex-center rounded-[20px] border-[1px] bg-[#8d2626] active:border-[red]"
          style={{ boxShadow: "0 0 5px #171716e3" }}
          onClick={() => {
            if (confirm("Are you sure to end the call ?")) handleEndCall();
          }}
        >
          End Call
        </button>
        <button
          title="Copy and share the URL to invite in the room"
          className="px-[10px] py-[5px] text-white flex-center rounded-[5px] border-[1px] bg-[#ffffff1f] active:bg-[green]"
          style={{ boxShadow: "0 0 5px #171716e3" }}
          onClick={() => window.open("/", "_blank")}
        >
          Create New Room
        </button>
        <button
          title="Copy and share the URL to invite in the room"
          className="px-[10px] py-[5px] text-white flex-center rounded-[5px] border-[1px] bg-[#ffffff1f] active:bg-[green]"
          style={{ boxShadow: "0 0 5px #171716e3" }}
          onClick={() => writeClipboardText(window.location.href)}
        >
          Copy Room URL
        </button>
      </div>
    </header>
  );
};

export default Header;

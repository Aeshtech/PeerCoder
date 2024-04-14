import { useEffect, useRef } from "react";

export const Video = ({
  muted,
  peer,
}: {
  muted: boolean;
  peer: {
    userId: string;
    userName: string;
    stream: MediaStream;
  };
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);
  return (
    <div className="relative shrink-0">
      <video
        height={300}
        muted={muted}
        autoPlay
        ref={videoRef}
        className="video w-[186px] h-[140px] rounded-[10px] border-[1px] border-[#ffffff1f]"
        style={{
          boxShadow: "2px 2px 5px 0px #00000045, -2px -2px 5px 0px #00000045",
        }}
      />
      <h4
        className="text-xs text-white absolute bottom-[2px] left-[10px] max-w-[150px] truncate overflow-hidden"
        style={{ textShadow: "1px 1px black" }}
      >
        {peer.userName}
      </h4>
    </div>
  );
};

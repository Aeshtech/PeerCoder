import { useEffect, useRef } from "react";

export const Video = ({
  muted,
  media,
}: {
  muted: boolean;
  media: MediaStream;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.srcObject = media;
    }
  }, [media]);
  return (
    <>
      <video
        height={300}
        width="100%"
        muted={muted}
        autoPlay
        ref={videoRef}
        className="video w-auto h-[140px] rounded-[10px] border-[1px] border-[#ffffff1f]"
        style={{
          boxShadow: "2px 2px 5px 0px #00000045, -2px -2px 5px 0px #00000045",
        }}
      />
    </>
  );
};

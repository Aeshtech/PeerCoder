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
        className="video"
      />
    </>
  );
};

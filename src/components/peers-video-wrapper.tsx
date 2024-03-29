import { PeersType } from "../App";
import { Video } from "../video";

const PeersVideoWrapper = ({
  peers,
  userId,
}: {
  peers: PeersType;
  userId: string;
}) => {
  return (
    <div
      className="flex flex-start gap-x-[15px] px-[20px] py-[5px] overflow-x-auto min-h-[150px] border-t-0 border-[1px] border-[#ffffff1f]"
      style={{
        boxShadow: "rgb(0 0 0 / 50%) 0px 0px 5px inset",
      }}
    >
      {peers.map((peer, index) => (
        <Video
          key={index}
          media={peer.stream}
          muted={userId === peer.userId ? true : false}
        ></Video>
      ))}
    </div>
  );
};

export default PeersVideoWrapper;

import { Link } from "react-router-dom";
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
      className="relative  min-h-[150px] border-t-0 border-[1px] border-[#ffffff1f] pr-[200px]"
      style={{
        boxShadow: "rgb(0 0 0 / 50%) 0px 0px 5px inset",
      }}
    >
      <div className="flex flex-start gap-x-[15px] px-[20px] py-[5px] overflow-x-auto">
        {peers.map((peer, index) => (
          <Video
            key={index}
            peer={peer}
            muted={userId === peer.userId ? true : false}
          ></Video>
        ))}
      </div>

      <div
        className="w-[186px] h-[140px] mt-[5px] rounded-l-[20px] border-[1px] border-[#ffffff1f] absolute right-0 top-0 bottom-0"
        style={{
          boxShadow: "2px 2px 5px 0px #00000045, -2px -2px 5px 0px #00000045",
        }}
      >
        <div className="flex-center mt-[10px]">
          <div className="grid grid-cols-2 gap-[10px] gap-x-[20px]">
            <Link to={"https://linkedin.com/in/aeshtech"} target="_blank">
              <img
                src="/public/images/linkedin.png"
                className="w-auto h-[40px]"
              />
            </Link>
            <Link to={"https://github.com/aeshtech"} target="_blank">
              <img
                src="/public/images/github.png"
                className="w-auto h-[40px] bg-white rounded-[10px]"
              />
            </Link>
            <Link to={"mailto:dev.aeshtech@gmail.com"} target="_blank">
              <img src="/public/images/gmail.png" className="w-auto h-[40px]" />
            </Link>
            <Link to={"https://instagram.com/aeshtech11"} target="_blank">
              <img
                src="/public/images/instagram.png"
                className="w-auto h-[40px]"
              />
            </Link>
          </div>
        </div>
        <h6 className="text-white text-xs ml-[15px] mt-[18px]">
          Ashish Sharma (Hire Me)
        </h6>
      </div>
    </div>
  );
};

export default PeersVideoWrapper;

const Header = ({ myPeerId, roomId }: { myPeerId: string; roomId: string }) => {
  return (
    <header
      className="h-[50px] flex items-center justify-between px-20 w-full border-[1px] border-[#ffffff1f] rounded-t-[10px]"
      style={{
        boxShadow: "inset 2px 2px 10px #050505ba",
      }}
    >
      <div>
        <h1 className="logo text-blackWhite text-2xl">PeerCoder</h1>
      </div>
      <div className="flex-center gap-x-[10px]">
        <span className="text-xs text-blackWhite mr-[20px]">
          My Id: {myPeerId}
        </span>
        <span className="text-xs text-blackWhite mr-[20px]">
          Room Id: {roomId}
        </span>
        <button>Camera</button>
        <button>Mic</button>
        <button>Room URL</button>
      </div>
    </header>
  );
};

export default Header;

import { useNavigate } from "react-router-dom";

const CallEnd = () => {
  const navigate = useNavigate();
  return (
    <section>
      <h1 className="text-6xl text-center  font-mono text-white mt-[20px]">
        Thanks for using PeerCoder
      </h1>
      <div className="flex-center mt-[50px]">
        <button
          title="Copy and share the URL to invite in the room"
          className="px-[10px] py-[5px] text-white flex-center rounded-[5px] border-[1px] bg-[#ffffff1f] active:bg-[green]"
          style={{ boxShadow: "0 0 5px #171716e3" }}
          onClick={() => {
            navigate("/");
            navigate(0); //for refresh app component
          }}
        >
          Create New Room
        </button>
      </div>
    </section>
  );
};

export default CallEnd;

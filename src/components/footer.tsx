import { Link } from "react-router-dom";

const Footer = ({ className }: { className?: string }) => {
  return (
    <div
      className={`${className} h-[100px] flex items-center justify-start px-5 w-full border-[1px] border-[#ffffff1f] rounded-b-[10px]`}
      style={{
        boxShadow: "inset 2px 2px 10px #  050505ba",
      }}
    >
      <address>
        <h1 className="text-xl text-white">Ashish Sharma</h1>
        <caption className="text-white w-max">Software Engineer</caption>
      </address>
      <div className="flex items-center mx-auto gap-x-[50px] max-h-[50px]">
        <Link to={"https://linkedin.com/in/aeshtech"} target="_blank">
          <img src="/images/linkedin.png" className="w-auto h-[50px]" />
        </Link>
        <Link to={"https://github.com/aeshtech"} target="_blank">
          <img
            src="/images/github.png"
            className="w-auto h-[50px] bg-white rounded-[10px]"
          />
        </Link>
        <Link to={"mailto:dev.aeshtech@gmail.com"} target="_blank">
          <img src="/images/gmail.png" className="w-auto h-[60px]" />
        </Link>
        <Link to={"https://instagram.com/aeshtech11"} target="_blank">
          <img src="/images/instagram.png" className="w-auto h-[50px]" />
        </Link>
        <Link to={"https://aeshtech.netlify.app"} target="_blank">
          <img
            src="/images/aeshtech-icon.png"
            className="w-auto h-[45px] bg-white rounded-[2px]"
          />
        </Link>
      </div>
    </div>
  );
};

export default Footer;

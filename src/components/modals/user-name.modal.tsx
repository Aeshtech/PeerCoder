import { useState } from "react";
import { setLocalStorage, validateName } from "../../utils/helpers";
type PropsType = {
  isModalOpen: boolean;
  userName: string;
  setUserName: (value: string) => void;
  setIsModalOpen: (value: boolean) => void;
};
const UserNameModal = ({
  isModalOpen,
  setIsModalOpen,
  userName,
  setUserName,
}: PropsType) => {
  const [err, setErr] = useState("");
  if (!isModalOpen) {
    return;
  }

  const handleJoinRoom = () => {
    const { verified, err } = validateName(userName);
    if (verified) {
      setIsModalOpen(false);
      setErr("");
      setUserName(userName);
      setLocalStorage("userName", userName);
    } else {
      setErr(err);
    }
  };

  const handleKeyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleJoinRoom();
    }
  };
  return (
    <>
      <div
        id="authentication-modal"
        aria-hidden="true"
        className="overflow-y-auto flex justify-center items-start overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="p-4 md:p-5">
              <form className="space-y-4" action="#">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-4 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Please Enter Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="John Doe"
                    required
                    value={userName}
                    onKeyDown={handleKeyEnter}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={handleJoinRoom}
                >
                  Join the Room
                </button>
                <div className="text-xs font-medium text-[#ff0000]">{err}</div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserNameModal;

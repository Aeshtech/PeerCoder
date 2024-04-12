import { useCallback, useEffect, useState } from "react";
import "./global.css";
import Peer, { MediaConnection } from "peerjs";
import io from "socket.io-client";
import { filterUniqueUsers, getLocalStorage } from "./utils/helpers";
import toast from "react-hot-toast";
import Editor from "./components/editor";
import Header from "./components/header";
import PeersVideoWrapper from "./components/peers-video-wrapper";
import UserNameModal from "./components/modals/user-name.modal";

export type PeersType = Array<{
  userId: string;
  userName: string;
  stream: MediaStream;
}>;
//creating peer instance and configuring the iceServers
const myPeer = new Peer({
  // host: "peerjs.92k.de",
  // port: 443,
  // debug: 3,
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:freeturn.net:3478" },
    ],
  },
});
const socket = io("https://peercoder-backend.onrender.com/");
const peersObj: { [key: string]: MediaConnection } = {};

function App({ roomId }: { roomId: string }) {
  const [userId, setUserId] = useState(""); //representing my peer id
  const [peers, setPeers] = useState<PeersType>([]);
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addVideoStream = useCallback(
    ({
      peerId,
      stream,
      userName,
    }: {
      peerId: string;
      stream: MediaStream;
      userName: string;
    }) => {
      //if peerId match with my userId then disable the vidoe & audio tracks for me to prevent from echo
      // if (userId === peerId) {
      //   stream.getVideoTracks()[0].enabled = false;
      //   stream.getAudioTracks()[0].enabled = false;
      // }

      //functional update is neccessary to get latest peers
      setPeers((prevPeers) => {
        let flag = false;
        const updatedPeers = prevPeers.map((item) => {
          //if prevPeer item contain userId match with incoming peerId then update its stream and mark falg = true
          //which will prevent it from adding again into list
          if (item.userId === peerId) {
            flag = true;
            return { ...item, stream };
          }
          return item;
        });

        //add new peer into list including its incoming stream and name
        if (!flag) {
          updatedPeers.push({ userId: peerId, stream, userName });
        }
        //filtering if there any duplicatee peers in list before updating setPeers
        const filteredUpdatedPeers = filterUniqueUsers(updatedPeers);
        return filteredUpdatedPeers;
      });
    },
    []
  );

  const connectToNewUser = useCallback(
    ({
      remotePeerId,
      myStream,
      myUserName,
      remoteUserName,
    }: {
      remotePeerId: string;
      myStream: MediaStream;
      myUserName: string;
      remoteUserName: string;
    }) => {
      //call to the new user using its id by provding  myStream and myUserName
      const call = myPeer.call(remotePeerId, myStream, {
        metadata: { myUserName },
      });
      //Listen for remote peer adds a stream.
      call.on("stream", (remoteVideoStream: MediaStream) => {
        addVideoStream({
          peerId: remotePeerId,
          stream: remoteVideoStream,
          userName: remoteUserName,
        });
      });
      //listen either me or remote user closes the media connection then filter out the remote user
      call.on("close", () => {
        setPeers((prevPeers) =>
          prevPeers.filter((peer) => peer.userId !== remotePeerId)
        );
      });
      peersObj[remotePeerId] = call;
    },
    [addVideoStream]
  );

  useEffect(() => {
    //Emitted when a connection to the PeerServer is established

    myPeer.on("open", (id: string) => {
      setUserId(id);
    });
    const initialUserName = getLocalStorage("userName") || "";
    if (!initialUserName) {
      setIsModalOpen(true);
    } else {
      setUserName(initialUserName);
    }
    if (initialUserName && userId && roomId) {
      //emits join room with roomId and the my peer id, emitting out of navigator so,
      //that remote user should connected even if he denies for camera/audio
      if (navigator) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream: MediaStream) => {
            //add my peerId and stream to list of peers
            addVideoStream({
              peerId: userId,
              stream,
              userName: initialUserName,
            });

            // when new user connected then call it by provding my stream
            socket.on("user-connected", (remotePeerId, remoteUserName) => {
              toast(`${remoteUserName} Joined!`, {
                icon: "🧑‍💻",
                id: "peer-connected",
              });
              connectToNewUser({
                remotePeerId,
                myStream: stream,
                myUserName: initialUserName,
                remoteUserName,
              });
            });

            //listen when remote peers's tries to call me
            myPeer.on("call", (call: MediaConnection) => {
              const { myUserName = "" } = call.metadata;
              //answer the call by providing my stream
              call.answer(stream);
              //listen if getting stream from remote
              call.on("stream", (userVideoStream: MediaStream) => {
                addVideoStream({
                  peerId: call.peer,
                  stream: userVideoStream,
                  userName: myUserName,
                });
              });
              //emitted either me or remote user closes the mediaconnection then filter out the remote user
              call.on("close", () => {
                setPeers((prevPeers) =>
                  prevPeers.filter((peer) => peer.userId !== call.peer)
                );
              });
              peersObj[call.peer] = call;
            });
            //emits join room with roomId and the my peer
            socket.emit("join-room", roomId, userId, initialUserName);
          })
          .catch((err) => {
            if (err.name === "NotAllowedError") {
              toast.error(
                "Permission denied. Please allow your camera and microphone permission required to work for PeerCoder."
              );
            } else if (err.name === "NotFoundError") {
              toast.error(
                "No media devices found. This could be due to missing or disconnected devices."
              );
            } else if (err.name === "NotReadableError") {
              toast.error(
                "Media input is not readable. This could be due to hardware failure or user denied access to media devices."
              );
            } else {
              toast.error("Error occurred while accessing media devices:");
              console.log(err);
            }
          });
      } else {
        console.error("navigator.mediaDevices is not supported");
      }
      socket.on("user-disconnected", (userId, userName) => {
        toast(`${userName} disconnected`, {
          icon: "🧑‍💻",
          id: "peer-connection-closed",
        });
        if (peersObj[userId]) peersObj[userId].close();
      });
    }
  }, [addVideoStream, connectToNewUser, roomId, userId, isModalOpen]);

  const handleVideoToggle = (userId: string) => {
    setPeers((prevPeers) =>
      prevPeers.map((peer) => {
        if (peer.userId === userId) {
          const enabled = peer.stream.getVideoTracks()[0].enabled;
          peer.stream.getVideoTracks()[0].enabled = !enabled;
          return peer;
        }
        return peer;
      })
    );
  };

  const handleAudioToggle = (userId: string) => {
    setPeers((prevPeers) =>
      prevPeers.map((peer) => {
        if (peer.userId === userId) {
          const enabled = peer.stream.getAudioTracks()[0].enabled;
          peer.stream.getAudioTracks()[0].enabled = !enabled;
          return peer;
        }
        return peer;
      })
    );
  };

  return (
    <main
      className="border-[0px] border-[#ffffff80] rounded-t-[10px] backdrop-blur-[8px]"
      style={{
        boxShadow:
          "2px 2px 10px rgba(0, 0, 0, 0.3), -2px 2px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Header
        userName={userName}
        setIsModalOpen={setIsModalOpen}
        myPeerId={userId}
        handleVideoToggle={handleVideoToggle}
        handleAudioToggle={handleAudioToggle}
      />
      <PeersVideoWrapper peers={peers} userId={userId} />
      <Editor socket={socket} />
      <UserNameModal
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        userName={userName}
        setUserName={setUserName}
      />
    </main>
  );
}

export default App;

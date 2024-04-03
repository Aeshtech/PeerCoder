import { useCallback, useEffect, useRef, useState } from "react";
import "./global.css";
import Peer, { MediaConnection } from "peerjs";
import io from "socket.io-client";
import { filterUniqueUsers } from "./utils/helpers";
import toast from "react-hot-toast";
import Editor from "./components/editor";
import Header from "./components/header";
import PeersVideoWrapper from "./components/peers-video-wrapper";

export type PeersType = Array<{
  userId: string;
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

// https://peer-coder.onrender.com
const socket = io("https://peer-coder.onrender.com");
const peersObj: { [key: string]: MediaConnection } = {};

function App({ roomId }: { roomId: string }) {
  const [userId, setUserId] = useState(""); //representing my peer id
  const [peers, setPeers] = useState<PeersType>([]);
  // const streamRef = useRef<MediaStream | undefined>();

  const addVideoStream = useCallback(
    ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
      //if peerId match with my userId then disable the vidoe & audio tracks for me to prevent from echo
      if (userId === peerId) {
        stream.getVideoTracks()[0].enabled = false;
        stream.getAudioTracks()[0].enabled = false;
      }
      //functional update is neccessary to get latest peers
      setPeers((prevPeers) => {
        let found = false;
        //just update the stream if peer userid match with my user id else return as it is.
        const updatedPeers = prevPeers.map((peer) => {
          if (peer.userId === userId) {
            found = true;
            return { ...peer, stream };
          }
          return peer;
        });
        //if its a new peer then add into list including its incoming stream
        if (!found) {
          updatedPeers.push({ userId: peerId, stream });
        }
        //filtering the duplicatee peers if any before set into peers
        const filteredUpdatedPeers = filterUniqueUsers(updatedPeers);
        return filteredUpdatedPeers;
      });
    },
    [userId]
  );
  const connectToNewUser = useCallback(
    (remotePeerId: string, stream: MediaStream) => {
      //call to the new user using its id and send our stream
      const call = myPeer.call(remotePeerId, stream);
      //Emitted when a remote peer adds a stream.
      call.on("stream", (remoteVideoStream) => {
        addVideoStream({
          peerId: remotePeerId,
          stream: remoteVideoStream,
        });
      });
      //emitted either me or remote user closes the media connection then filter out the remote user
      call.on("close", () => {
        setPeers((prevPeers) =>
          prevPeers.filter((peer) => peer.userId !== remotePeerId)
        );
        toast("Peer Connection Closed!", {
          icon: "🧑‍💻",
          id: "peer-connection-closed",
        });
      });
      peersObj[remotePeerId] = call;
    },
    [addVideoStream]
  );

  useEffect(() => {
    //Emitted when a connection to the PeerServer is established
    myPeer.on("open", (id) => {
      if (navigator) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream: MediaStream) => {
            setUserId(id);
            //add my peerId and stream to list of peers
            addVideoStream({ peerId: id, stream });

            // Assign the stream to useRef
            // if (streamRef) {
            //   streamRef.current = stream; // Add semicolon her
            // }

            //when new user connected then call it by provding my stream
            socket.on("user-connected", (userId) => {
              toast("New Peer Connected!", {
                icon: "🧑‍💻",
                id: "peer-connected",
              });
              connectToNewUser(userId, stream);
            });

            //emitter when remote user's tries to call me
            myPeer.on("call", (call) => {
              //answer the call by providing my stream
              call.answer(stream);
              //emitted if getting stream from remote
              call.on("stream", (userVideoStream) => {
                addVideoStream({
                  peerId: call.peer,
                  stream: userVideoStream,
                });
              });
              //emitted either me or remote user closes the mediaconnection then filter out the remote user
              call.on("close", () => {
                toast("Peer Connection Closed!", {
                  icon: "🧑‍💻",
                  id: "peer-connection-closed",
                });
                setPeers((prevPeers) =>
                  prevPeers.filter((peer) => peer.userId !== call.peer)
                );
              });
              peersObj[call.peer] = call;
            });

            //emits join room with roomId and the my peer id
            socket.emit("join-room", roomId, id);
          })
          .catch((err) => {
            if (err.name === "NotAllowedError") {
              toast.error(
                "Permission denied. Please allow your camera and microphone permission."
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
    });

    socket.on("user-disconnected", (userId) => {
      if (peersObj[userId]) peersObj[userId].close();
    });

    return () => {
      // const cleanupWrapper = () => {
      //   socket.off("user-connected", (userId) =>
      //     connectToNewUser(userId, streamRef.current)
      //   );
      // };
      // cleanupWrapper();
    };
  }, [addVideoStream, connectToNewUser, peers, roomId, userId]);

  return (
    <main
      className="border-[0px] border-[#ffffff80] rounded-t-[10px] backdrop-blur-[8px]"
      style={{
        boxShadow:
          "2px 2px 10px rgba(0, 0, 0, 0.3), -2px 2px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Header roomId={roomId} myPeerId={userId} />
      <PeersVideoWrapper peers={peers} userId={userId} />
      <Editor socket={socket} />
    </main>
  );
}

export default App;

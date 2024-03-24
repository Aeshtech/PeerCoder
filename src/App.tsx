import { useEffect, useState } from "react";
import "./App.css";
import Peer, { MediaConnection } from "peerjs";
import io from "socket.io-client";
import { Video } from "./video";

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
      // { urls: "stun:freeturn.net:5349" },
    ],
  },
});
// https://peer-coder.onrender.com/
const socket = io("https://peer-coder.onrender.com/");
const peersObj: { [key: string]: MediaConnection } = {};

function App({ roomId }: { roomId: string }) {
  const [userId, setUserId] = useState("");
  const [peers, setPeers] = useState<
    Array<{ userId: string; stream: MediaStream }>
  >([]);

  const [me, setMe] = useState<{ userId: string; stream: MediaStream }>();
  const [remote, setRemote] = useState<{
    userId: string;
    stream: MediaStream;
  }>();

  console.log({ roomId });
  console.log({ peers });
  useEffect(() => {
    const connectToNewUser = (userId: string, stream: MediaStream) => {
      // console.log({ remoteUserId: userId });
      const call = myPeer.call(userId, stream);
      call.on("stream", (userVideoStream) => {
        // console.log({ remoteStream: userVideoStream });
        setRemote({ userId, stream: userVideoStream });
        addVideoStream({
          peerId: userId,
          stream: userVideoStream,
          flag: false,
        });
      });
      call.on("close", () => {
        console.log("called close line 48");
        const peersCopy = Array.from(peers);
        const peersModified = peersCopy.filter((peer) => {
          return peer.userId !== userId;
        });
        setPeers(peersModified);
      });
      peersObj[userId] = call;
    };

    const addVideoStream = ({
      peerId,
      stream,
      flag,
    }: {
      peerId: string;
      stream: MediaStream;
      flag: boolean;
    }) => {
      if (userId === peerId) {
        stream.getVideoTracks()[0].enabled = false;
        stream.getAudioTracks()[0].enabled = false;
      }
      let peersCopy = Array.from(peers);
      peersCopy = peersCopy.map((peer) => {
        if (peer.userId === userId) {
          peer.stream = stream;
          flag = true;
        }
        return peer;
      });
      if (!flag) peersCopy.push({ userId: peerId, stream: stream });
      setPeers(peersCopy);
    };

    myPeer.on("open", (id) => {
      if (navigator) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream: MediaStream) => {
            setUserId(id);
            setMe({ userId: id, stream });
            addVideoStream({ peerId: id, stream, flag: false });

            socket.on("user-connected", (userId) => {
              connectToNewUser(userId, stream);
            });

            myPeer.on("call", (call) => {
              call.answer(stream);
              call.on("stream", (userVideoStream) => {
                // console.log({
                //   remotePeerId: call.peer,
                //   remoteStream: userVideoStream,
                // });
                setRemote({ userId: call.peer, stream: userVideoStream });
                addVideoStream({
                  peerId: call.peer,
                  stream: userVideoStream,
                  flag: false,
                });
              });
              call.on("close", () => {
                console.log("called close line 112");
                const peersCopy = Array.from(peers);
                const peersModified = peersCopy.filter((peer) => {
                  return peer.userId !== call.peer;
                });
                setPeers(peersModified);
              });
              peersObj[call.peer] = call;
            });
            socket.emit("join-room", roomId, id);
          });
      }
    });

    socket.on("user-disconnected", (userId) => {
      if (peersObj[userId]) peersObj[userId].close();
    });
  }, [peers, roomId, userId]);

  return (
    <section>
      <h1>Video Stream</h1>
      <div>
        <h5>Room Id: {roomId}</h5>
        <h5>My User Id: {userId}</h5>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {/* {peers.map((peer) => (
          <Video
            key={peer.userId}
            media={peer.stream}
            muted={userId === peer.userId ? true : false}
          ></Video>
        ))} */}
        <div style={{ display: "flex", columnGap: "20px" }}>
          <div>
            <h3>LocalStream</h3>
            <h6>Remote Id: {me?.userId}</h6>
            <h6>Stream Id: {me?.stream?.id}</h6>
            {me?.stream && <Video media={me?.stream} muted={true} />}
          </div>
          <div>
            <h3>RemoteStream</h3>
            <h6>Remote Id: {remote?.userId}</h6>
            <h6>Stream Id: {remote?.stream?.id}</h6>
            {remote?.stream && <Video media={remote?.stream} muted={false} />}
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;

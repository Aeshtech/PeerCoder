import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Peer, { MediaConnection } from "peerjs";
import io from "socket.io-client";
import { Video } from "./video";
import { filterUniqueUsers } from "./utils/helpers";

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

console.log({ instance: myPeer.id });
// https://peer-coder.onrender.com
const socket = io("http://localhost:4000");
const peersObj: { [key: string]: MediaConnection } = {};

function App({ roomId }: { roomId: string }) {
  const [userId, setUserId] = useState("");
  const [peers, setPeers] = useState<
    Array<{ userId: string; stream: MediaStream }>
  >([]);

  // const [me, setMe] = useState<{ userId: string; stream: MediaStream }>();
  // const [remote, setRemote] = useState<{
  //   userId: string;
  //   stream: MediaStream;
  // }>();

  console.log({ peers });

  const addVideoStream = useCallback(
    ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
      if (userId === peerId) {
        stream.getVideoTracks()[0].enabled = false;
        stream.getAudioTracks()[0].enabled = false;
      }

      setPeers((prevPeers) => {
        let found = false;
        const updatedPeers = prevPeers.map((peer) => {
          if (peer.userId === userId) {
            found = true;
            return { ...peer, stream };
          }
          return peer;
        });

        if (!found) {
          updatedPeers.push({ userId: peerId, stream });
        }

        const filteredUpdatedPeers = filterUniqueUsers(updatedPeers);
        return filteredUpdatedPeers;
      });
    },
    [userId]
  );

  const connectToNewUser = useCallback(
    (userId: string, stream: MediaStream) => {
      const call = myPeer.call(userId, stream);
      call.on("stream", (userVideoStream) => {
        addVideoStream({
          peerId: userId,
          stream: userVideoStream,
        });
      });
      call.on("close", () => {
        setPeers((prevPeers) =>
          prevPeers.filter((peer) => peer.userId !== userId)
        );
      });
      peersObj[userId] = call;
    },
    [addVideoStream]
  );

  useEffect(() => {
    //  const connectToNewUser = (userId: string, stream: MediaStream) => {
    //    const call = myPeer.call(userId, stream);
    //    call.on("stream", (userVideoStream) => {
    //      addVideoStream({
    //        peerId: userId,
    //        stream: userVideoStream,
    //        flag: false,
    //      });
    //    });
    //    call.on("close", () => {
    //      const peersCopy = Array.from(peers);
    //      const peersModified = peersCopy.filter((peer) => {
    //        return peer.userId !== userId;
    //      });
    //      setPeers(peersModified);
    //    });
    //    peersObj[userId] = call;
    //  };

    //  const addVideoStream = ({
    //    peerId,
    //    stream,
    //    flag,
    //  }: {
    //    peerId: string;
    //    stream: MediaStream;
    //    flag: boolean;
    //  }) => {
    //    if (userId === peerId) {
    //      stream.getVideoTracks()[0].enabled = false;
    //      stream.getAudioTracks()[0].enabled = false;
    //    }
    //    let peersCopy = [...peers];
    //    peersCopy = peersCopy.map((peer) => {
    //      //if peer found in list match with my userId just update the stream and make flag true
    //      if (peer.userId === userId) {
    //        peer.stream = stream;
    //        flag = true;
    //      }
    //      return peer;
    //    });
    //    //just add new peer to list
    //    if (!flag) peersCopy.push({ userId: peerId, stream: stream });
    //    setPeers(peersCopy);
    //  };

    myPeer.on("open", (id) => {
      if (navigator) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream: MediaStream) => {
            setUserId(id);
            // setMe({ userId: id, stream });

            //add my peerId and stream to list of peers
            addVideoStream({ peerId: id, stream });

            socket.on("user-connected", (userId) => {
              connectToNewUser(userId, stream);
            });

            myPeer.on("call", (call) => {
              call.answer(stream);
              call.on("stream", (userVideoStream) => {
                console.log({
                  remotePeerId: call.peer,
                  remoteStream: userVideoStream,
                });
                // setRemote({ userId: call.peer, stream: userVideoStream });
                addVideoStream({
                  peerId: call.peer,
                  stream: userVideoStream,
                });
              });
              call.on("close", () => {
                setPeers((prevPeers) =>
                  prevPeers.filter((peer) => peer.userId !== call.peer)
                );
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
  }, [addVideoStream, connectToNewUser, peers, roomId, userId]);

  return (
    <section>
      <h1>Video Stream</h1>
      <div>
        <h5>Room Id: {roomId}</h5>
        <h5>My User Id: {userId}</h5>
      </div>
      <ol>
        {peers.map((item, index) => (
          <li key={index}>
            UserId = {item.userId}, StreamId = {item.stream.id}
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {peers.map((peer, index) => (
          <Video
            key={index}
            media={peer.stream}
            muted={userId === peer.userId ? true : false}
          ></Video>
        ))}
        {/* <div style={{ display: "flex", columnGap: "20px" }}>
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
        </div> */}
      </div>
    </section>
  );
}

export default App;

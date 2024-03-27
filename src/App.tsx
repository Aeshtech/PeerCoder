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
const socket = io("https://peer-coder.onrender.com");
const peersObj: { [key: string]: MediaConnection } = {};

function App({ roomId }: { roomId: string }) {
  const [userId, setUserId] = useState("");
  const [peers, setPeers] = useState<
    Array<{ userId: string; stream: MediaStream }>
  >([]);

  console.log({ peers });

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
            //emits join room with roomId and the my peer id
            socket.emit("join-room", roomId, id);

            setUserId(id);
            //add my peerId and stream to list of peers
            addVideoStream({ peerId: id, stream });

            //when new user connected then call it by provding my stream
            socket.on("user-connected", (userId) => {
              connectToNewUser(userId, stream);
            });

            //emitter when a remote user tries to call me
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
                setPeers((prevPeers) =>
                  prevPeers.filter((peer) => peer.userId !== call.peer)
                );
              });
              peersObj[call.peer] = call;
            });
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
      </div>
    </section>
  );
}

export default App;

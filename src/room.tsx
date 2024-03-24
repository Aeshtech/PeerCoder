import { useParams } from "react-router-dom";
import App from "./App";

function Room() {
  const { roomId } = useParams();
  return <App roomId={roomId || ""} />;
}

export default Room;

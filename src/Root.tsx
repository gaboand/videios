import "./index.css";
import { Composition } from "remotion";
import { Transicion } from "./Transicion";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // npx remotion render Transicion
      id="Transicion"
      component={Transicion}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1350}
    />
  );
};

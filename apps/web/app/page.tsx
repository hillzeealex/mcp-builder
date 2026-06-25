import { EXAMPLE_DEFINITION } from "./example";
import { Playground } from "./playground";

export default function Home() {
  return <Playground initialSource={EXAMPLE_DEFINITION} />;
}

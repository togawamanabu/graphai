import "dotenv/config";
import { graphDataTestRunner } from "~/utils/runner";
import { sleeperAgent  } from "@/experimental_agents";
import openaiVisionAgentInfo from "./openai_vision_agent";

import input from "@inquirer/input";

const graph_data = {
  version: 0.3,
  nodes: {
    imagePath: {
      agent: async () => input({ message: "Path to the image file:" }),
    },
    vision: {
      agent: "openaiVisionAgentInfo",
      params: {
        model: "gpt-4o",
        verbose: true,
        query: '画像の状況や映っているものをできるだけ正確かつ丁寧に説明してください。'
      },
      inputs: [undefined, undefined, ":imagePath"],
      isResult: true,
    },
    answer: {
        agent: "sleeperAgent",
        inputs: [":vision.choices.$0.message"],
      },
  },
};

export const main = async () => {
  const result = await graphDataTestRunner(__filename, graph_data, { openaiVisionAgentInfo, sleeperAgent });
  console.log(result);
};

if (process.argv[1] === __filename) {
  main();
}

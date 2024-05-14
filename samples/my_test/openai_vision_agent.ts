import OpenAI from "openai";
import { AgentFunction } from "@/graphai";
import { sleep } from "@/utils/utils";

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

export const openAIVisionAgent: AgentFunction<
  {
    model?: string;
    query?: string;
    system?: string;
    verbose?: boolean;
    temperature?: number;
  },
  Record<string, any> | string,
  string | Array<any>
> = async ({ filterParams, params, inputs }) => {
  const { verbose, query, system, temperature } = params;
  const [input_query, previous_messages, image_path] = inputs;


  // Notice that we ignore params.system if previous_message exists.
  const messages: Array<any> = previous_messages && Array.isArray(previous_messages) ? previous_messages : system ? [{ role: "system", content: system }] : [];

  const content = (query ? [query] : []).concat(input_query ? [input_query as string] : []).join("\n");
  if (content) {
    messages.push({
      role: "user",
      content,
    });
  }


  if(verbose) {
      console.log("imagePath : ", image_path as string);
  }

  if (image_path) {
    const imageBuffer = await readFileAsync(image_path as string);
    const base64_image = imageBuffer.toString('base64');
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: query? query : "What’s in this image?"
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64_image}`
          }
        }
      ]
    });
  }

  if (verbose) {
    console.log(messages);
  }

  const openai = new OpenAI();

  const chatStream = await openai.beta.chat.completions.stream({
    model: params.model || "gpt-3.5-turbo",
    messages,
    temperature: temperature ?? 0.7,
    stream: true,
  });

  for await (const message of chatStream) {
    const token = message.choices[0].delta.content;
    if (filterParams && filterParams.streamTokenCallback && token) {
      filterParams.streamTokenCallback(token);
    }
  }

  const chatCompletion = await chatStream.finalChatCompletion();
  return chatCompletion;
};

const input_sample = "this is response result";
const result_sample = {
  object: "chat.completion",
  id: "chatcmpl-9N7HxXYbwjmdbdiQE94MHoVluQhyt",
  choices: [
    {
      message: {
        role: "assistant",
        content: input_sample,
      },
      finish_reason: "stop",
      index: 0,
      logprobs: null,
    },
  ],
  created: 1715296589,
  model: "gpt-3.5-turbo-0125",
};

export const openAIVisionMockAgent: AgentFunction<
  {
    model?: string;
    query?: string;
    system?: string;
    verbose?: boolean;
    temperature?: number;
  },
  Record<string, any> | string,
  string | Array<any>
> = async ({ filterParams }) => {
  for await (const token of input_sample.split("")) {
    if (filterParams && filterParams.streamTokenCallback && token) {
      await sleep(100);
      filterParams.streamTokenCallback(token);
    }
  }

  return result_sample;
};
const openaiVisionAgentInfo = {
  name: "openAIVisionAgent",
  agent: openAIVisionAgent,
  mock: openAIVisionMockAgent,
  samples: [
    {
      inputs: [input_sample],
      params: {},
      result: result_sample,
    },
  ],
  skipTest: true,
  description: "Openai Vision Agent",
  category: ["llm"],
  author: "Receptron team",
  repository: "https://github.com/receptron/graphai",
  license: "MIT",
};

export default openaiVisionAgentInfo;

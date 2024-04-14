import { AgentFunction } from "@/graphai";
import deepmerge from "deepmerge";

export const dataObjectMergeTemplateAgent: AgentFunction = async ({ nodeId, params, inputs, verbose }) => {
  if (verbose) {
    console.log("executing", nodeId, params);
  }
  return inputs.reduce((tmp, input) => {
    return deepmerge(tmp, input);
  }, {});
};

export const dataSumTemplateAgent: AgentFunction<Record<string, any>, number, number> = async ({ nodeId, params, inputs, verbose }) => {
  if (verbose) {
    console.log("executing", nodeId, params);
  }
  return inputs.reduce((tmp, input) => {
    return tmp + input;
  }, 0);
};
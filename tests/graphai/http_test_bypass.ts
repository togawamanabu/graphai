import { AgentFunction } from "@/graphai";

import { graphDataTestRunner } from "~/utils/runner";

import test from "node:test";
import assert from "node:assert";

const httpAgent: AgentFunction = async ({ inputs, params }) => {
  const { agentId, params: postParams } = params;
  const url = "http://localhost:8085/agents/" + agentId;

  const postData = { inputs, params: postParams };

  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });
  const result = await response.json();
  return result;
};

test("test bypass1", async () => {
  const graph_data = {
    nodes: {
      echo: {
        agentId: "httpAgent",
        params: {
          agentId: "echoAgent",
          params: {
            message: "hello",
          },
        },
      },
      bypassAgent: {
        agentId: "httpAgent",
        inputs: ["echo"],
        params: {
          agentId: "bypassAgent",
        },
      },
      bypassAgent2: {
        agentId: "httpAgent",
        inputs: ["bypassAgent"],
        params: {
          agentId: "bypassAgent",
        },
      },
    },
  };
  const result = await graphDataTestRunner(__filename, graph_data, { httpAgent });
  assert.deepStrictEqual(result, {
    bypassAgent2: {
      message: "hello",
    },
    bypassAgent: {
      message: "hello",
    },
    echo: {
      message: "hello",
    },
  });
  // console.log("COMPLETE 1");
});

test("test bypass2", async () => {
  const graph_data = {
    nodes: {
      echo: {
        agentId: "httpAgent",
        params: {
          agentId: "echoAgent",
          params: {
            message: ["hello", "hello"],
          },
        },
      },
      mapNode: {
        agentId: "mapAgent",
        inputs: ["echo.message"],
        params: {
          injectionTo: ["memory"],
        },
        graph: {
          nodes: {
            memory: {
              value: {},
            },
            bypassAgent: {
              agentId: "httpAgent",
              params: {
                agentId: "bypassAgent",
              },
              inputs: ["memory"],
              isResult: true,
            },
          },
        },
      },
      bypassAgent2: {
        agentId: "httpAgent",
        params: {
          agentId: "bypassAgent",
        },
        inputs: ["mapNode"],
      },
    },
  };
  const result = await graphDataTestRunner(__filename, graph_data, { httpAgent });
  console.log(result);
  assert.deepStrictEqual(result, {
    echo: { message: ["hello", "hello"] },
    mapNode: { bypassAgent: ["hello", "hello"] },
    bypassAgent2: { bypassAgent: ["hello", "hello"] },
  });
  // console.log("COMPLETE 1");
});

test("test bypass3", async () => {
  const graph_data = {
    nodes: {
      echo: {
        agentId: "httpAgent",
        params: {
          agentId: "echoAgent",
          params: {
            message: ["hello", "hello"],
          },
        },
      },
      mapNode: {
        agentId: "mapAgent",
        inputs: ["echo.message"],
        params: {
          injectionTo: ["memory"],
        },
        graph: {
          nodes: {
            memory: {
              value: {},
            },
            bypassAgent: {
              agentId: "httpAgent",
              params: {
                agentId: "bypassAgent",
              },
              inputs: ["memory"],
            },
            bypassAgent2: {
              agentId: "httpAgent",
              params: {
                agentId: "bypassAgent",
              },
              inputs: ["bypassAgent"],
            },
            bypassAgent3: {
              agentId: "httpAgent",
              params: {
                agentId: "bypassAgent",
              },
              inputs: ["bypassAgent2"],
              isResult: true,
            },
          },
        },
      },
      bypassAgent4: {
        agentId: "httpAgent",
        params: {
          agentId: "bypassAgent",
        },
        inputs: ["mapNode.bypassAgent3"],
      },
    },
  };
  const result = await graphDataTestRunner(__filename, graph_data, { httpAgent });
  console.log(result);
  assert.deepStrictEqual(result, {
    echo: { message: ["hello", "hello"] },
    mapNode: { bypassAgent3: ["hello", "hello"] },
    bypassAgent4: ["hello", "hello"],
  });
  // console.log("COMPLETE 1");
});

test("test bypass4", async () => {
  const graph_data = {
    nodes: {
      echo: {
        agentId: "httpAgent",
        params: {
          agentId: "echoAgent",
          params: {
            message: ["hello", "hello"],
          },
        },
      },
      mapNode: {
        agentId: "mapAgent",
        inputs: ["echo.message"],
        params: {
          injectionTo: ["memory"],
        },
        graph: {
          nodes: {
            memory: {
              value: {},
            },
            bypassAgent: {
              agentId: "httpAgent",
              params: {
                agentId: "bypassAgent",
              },
              inputs: ["memory"],
            },
            bypassAgent2: {
              agentId: "httpAgent",
              params: {
                agentId: "bypassAgent",
              },
              inputs: ["bypassAgent", "memory"],
              isResult: true,
            },
          },
        },
      },
      bypassAgent3: {
        agentId: "httpAgent",
        params: {
          agentId: "bypassAgent",
        },
        inputs: ["mapNode"],
      },
    },
  };
  const result = await graphDataTestRunner(__filename, graph_data, { httpAgent });
  // console.log(result);
  assert.deepStrictEqual(result, {
    echo: { message: ["hello", "hello"] },
    mapNode: {
      bypassAgent2: [
        ["hello", "hello"],
        ["hello", "hello"],
      ],
    },
    bypassAgent3: {
      bypassAgent2: [
        ["hello", "hello"],
        ["hello", "hello"],
      ],
    },
  });
  // console.log("COMPLETE 1");
});
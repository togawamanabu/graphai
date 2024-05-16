import { AgentFunction } from "../../index";
export declare const textInputAgent: AgentFunction<{
    message?: string;
}, string | {
    [x: string]: string;
}>;
declare const textInputAgentInfo: {
    name: string;
    agent: AgentFunction<{
        message?: string | undefined;
    }, string | {
        [x: string]: string;
    }>;
    mock: AgentFunction<{
        message?: string | undefined;
    }, string | {
        [x: string]: string;
    }>;
    samples: never[];
    description: string;
    category: string[];
    author: string;
    repository: string;
    license: string;
};
export default textInputAgentInfo;
import { CustomContext } from "./context";

export interface Command {
	name: string;
	collect: (ctx: CustomContext) => Promise<void>;
}

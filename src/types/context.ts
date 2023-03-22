import { Context, Scenes } from "telegraf";

export interface CustomSession extends Scenes.SceneSessionData {
	state?: {
		name?: string;
		description?: string;
	};
}

export interface CustomContext extends Context {
	scene: Scenes.SceneContextScene<CustomContext, CustomSession>;
}

import { Telegraf, session, Scenes } from "telegraf";
import { CustomContext } from "../types/context";
import scenes from "../scenes/index";

require("dotenv").config();

export const telegramClient = new Telegraf<CustomContext>(
	process.env.TELEGRAM_TOKEN
);

export async function startBot(): Promise<void> {
	const stage = new Scenes.Stage<CustomContext>(scenes);

	telegramClient.use(session());
	telegramClient.use(stage.middleware());

	telegramClient.start((ctx) => ctx.scene.enter("start"));

	telegramClient.launch().then(() => console.log("Telegram connected!"));

	process.once("SIGINT", () => telegramClient.stop("SIGINT"));
	process.once("SIGTERM", () => telegramClient.stop("SIGTERM"));
	process.on("uncaughtException", (e) => console.log(e));
}

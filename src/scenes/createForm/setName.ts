import { Scenes } from "telegraf";
import { CustomContext } from "../../types/context";

export const setName = new Scenes.BaseScene<CustomContext>("setName")
	.enter(async (ctx) => {
		ctx.reply("Как тебя зовут?", { reply_markup: { remove_keyboard: true } });
	})
	.on("text", (ctx) => {
		ctx.deleteMessage(ctx.message.message_id);

		ctx.scene.enter("setDescription", {
			name: ctx.message.text,
		});
	});

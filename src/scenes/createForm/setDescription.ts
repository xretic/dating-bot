import { Scenes } from "telegraf";
import { CustomContext } from "../../types/context";

export const setDescription = new Scenes.BaseScene<CustomContext>(
	"setDescription"
)
	.enter(async (ctx) => {
		ctx.reply("Опиши себя");
	})
	.on("text", (ctx) => {
		ctx.deleteMessage(ctx.message.message_id);

		ctx.scene.enter("setAge", {
			name: ctx.scene.session.state.name,
			description: ctx.message.text,
		});
	});

import { Scenes } from "telegraf";
import { CustomContext } from "../types/context";
import { prisma } from "../common/prisma";

export const viewForm = new Scenes.BaseScene<CustomContext>("viewForm").enter(
	async (ctx) => {
		const user = await prisma.form.findFirst({
			where: {
				telegram_user_id: ctx.from.id,
			},
		});

		await ctx.reply(
			"*Ваша анкета*\n\n" +
				`Имя: \`${user.name}\`\n` +
				`Возраст: \`${user.age}\`\n` +
				`Описание: \`${user.description}\`\n` +
				`Просмотров: \`${user.views}\`\n` +
				`Лайков: \`${user.likes}\``,
			{
				parse_mode: "Markdown",
			}
		);

		ctx.scene.enter("start");
	}
);

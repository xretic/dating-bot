import { Scenes, Markup } from "telegraf";
import { prisma } from "../common/prisma";
import { CustomContext } from "../types/context";

export const start = new Scenes.BaseScene<CustomContext>("start")
	.enter(async (ctx) => {
		const user = await prisma.form.findFirst({
			where: {
				telegram_user_id: ctx.from.id,
			},
		});

		let mutual: number = 0;

		if (user) {
			mutual = Number(user.likes);
		}

		ctx.reply("*Выбери нужное*", {
			parse_mode: "Markdown",
			...Markup.keyboard([["📝 Анкета"], ["💌 Поиск", "🎊 Лайки"]]),
		});
	})
	.hears("📝 Анкета", (ctx) => ctx.scene.enter("form"))
	.hears("💌 Поиск", (ctx) => ctx.scene.enter("search"))
	.hears("🎊 Лайки", (ctx) => ctx.scene.enter("likes"));

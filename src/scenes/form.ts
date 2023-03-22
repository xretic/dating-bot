import { Scenes } from "telegraf";
import { CustomContext } from "../types/context";
import formKeyboard from "../helpers/formKeyboard";
import { prisma } from "../common/prisma";

export const form = new Scenes.BaseScene<CustomContext>("form")
	.enter(async (ctx) => {
		const user = await prisma.form.findFirst({
			where: {
				telegram_user_id: ctx.from.id,
			},
		});

		ctx.reply("Выберите действие", formKeyboard(user));
	})
	.hears("✏️ Создать", (ctx) => ctx.scene.enter("setName"))
	.hears("✏️ Редактировать", (ctx) => ctx.scene.enter("setName"))
	.hears("📑 Просмотреть", (ctx) => ctx.scene.enter("viewForm"));

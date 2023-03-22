import { Scenes } from "telegraf";
import { prisma } from "../../common/prisma";
import { CustomContext } from "../../types/context";

export const setAge = new Scenes.BaseScene<CustomContext>("setAge")
	.enter(async (ctx) => {
		ctx.reply("Сколько тебе лет?");
	})
	.on("text", async (ctx) => {
		ctx.deleteMessage(ctx.message.message_id);

		const name = ctx.scene.session.state.name;
		const description = ctx.scene.session.state.description;
		const age = Number(ctx.message.text);

		if (!age) {
			ctx.reply("Вы ввели некорректный возраст!");
			return ctx.scene.enter("form");
		}

		if (age < 18 || age > 90) {
			ctx.reply(
				age < 18
					? "Для использование бота вам должно быть полных 18 лет!"
					: "Вы ввели возраст, который больше 90!"
			);

			return ctx.scene.enter("form");
		}

		const user = await prisma.form.findFirst({
			where: {
				telegram_user_id: ctx.from.id,
			},
		});

		if (user) {
			await prisma.form.update({
				where: {
					telegram_user_id: ctx.from.id,
				},

				data: {
					name: name,
					age: age,
					description: description,
				},
			});
		} else {
			await prisma.form.create({
				data: {
					telegram_user_id: ctx.from.id,
					chat_id: ctx.chat.id,
					name: name,
					age: age,
					description: description,
				},
			});
		}

		await ctx.reply(
			"*Ваша анкета*\n\n" +
				`Имя: \`${name}\`\n` +
				`Возраст: \`${age}\`\n` +
				`Описание: \`${description}\``,
			{
				parse_mode: "Markdown",
			}
		);

		ctx.scene.enter("start");
	});

import { Scenes, Markup } from "telegraf";
import { CustomContext } from "../types/context";
import { prisma } from "../common/prisma";
import { ActiveSearch, Form } from "@prisma/client";
import reciprocitySend from "../helpers/reciprocitySend";

export const search = new Scenes.BaseScene<CustomContext>("search")
	.enter(async (ctx) => {
		const user = await prisma.form.findFirst({
			where: {
				telegram_user_id: ctx.from.id,
			},
		});

		if (!user) {
			await ctx.reply("*Вы не создали анкету!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		const searched = await prisma.form.findMany({
			where: {
				telegram_user_id: {
					not: user.telegram_user_id,
				},

				age: {
					gt: user.age - 4,
					lt: user.age + 4,
				},
			},
		});

		const activeSearch = await prisma.activeSearch.upsert({
			where: {
				telegram_user_id: ctx.from.id,
			},

			update: {},

			create: {
				telegram_user_id: ctx.from.id,
			},
		});

		if (searched.length === 0 || !searched[activeSearch.pagination]) {
			await ctx.reply("*На данный момент нет активных анкет!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		await ctx.reply(
			`*Анкета №${activeSearch.pagination + 1}*\n\n` +
				`Имя: \`${searched[activeSearch.pagination].name}\`\n` +
				`Возраст: \`${searched[activeSearch.pagination].age}\`\n` +
				`Описание: \`${searched[activeSearch.pagination].description}\``,

			{
				parse_mode: "Markdown",
				...Markup.keyboard([["💗", "▶️"], ["💤"]]),
			}
		);
	})

	.hears("💗", async (ctx) => {
		const [user, searched, activeSearch] = await getCurrectPage(ctx);

		await prisma.form.update({
			where: {
				telegram_user_id:
					searched[activeSearch.pagination - 1].telegram_user_id,
			},

			data: {
				likes: {
					increment: 1,
				},
			},
		});

		const userLike = await prisma.like.create({
			data: {
				telegram_user_id: user.telegram_user_id,
				form_id: searched[activeSearch.pagination - 1].id,
			},
		});

		const checkLike = await prisma.like.findFirst({
			where: {
				telegram_user_id:
					searched[activeSearch.pagination - 1].telegram_user_id,
				form_id: user.id,
			},
		});

		await ctx.reply("*Вы успешно поставили лайк пользователю!*", {
			parse_mode: "Markdown",
		});

		if (checkLike) {
			await reciprocitySend(
				ctx,
				user,
				searched[activeSearch.pagination - 1],
				userLike.id,
				checkLike.id
			);
		}

		if (!searched[activeSearch.pagination]) {
			ctx.reply("*Нет доступных анкет для дальнейшего сёрфинга!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		await ctx.reply(
			`*Анкета №${activeSearch.pagination + 1}*\n\n` +
				`Имя: \`${searched[activeSearch.pagination].name}\`\n` +
				`Возраст: \`${searched[activeSearch.pagination].age}\`\n` +
				`Описание: \`${searched[activeSearch.pagination].description}\``,

			{
				parse_mode: "Markdown",
				...Markup.keyboard([["💗", "▶️"], ["💤"]]),
			}
		);
	})

	.hears("▶️", async (ctx) => {
		const [, searched, activeSearch] = await getCurrectPage(ctx);

		if (!searched[activeSearch.pagination]) {
			return ctx.reply("*Нет доступных анкет!*", {
				parse_mode: "Markdown",
			});
		}

		await ctx.reply(
			`*Анкета №${activeSearch.pagination + 1}*\n\n` +
				`Имя: \`${searched[activeSearch.pagination].name}\`\n` +
				`Возраст: \`${searched[activeSearch.pagination].age}\`\n` +
				`Описание: \`${searched[activeSearch.pagination].description}\``,

			{
				parse_mode: "Markdown",
				...Markup.keyboard([["💗", "▶️"], ["💤"]]),
			}
		);
	})
	.hears("💤", (ctx) => ctx.scene.enter("start"));

const getCurrectPage = async (
	ctx: CustomContext
): Promise<[Form, Form[], ActiveSearch]> => {
	const user = await prisma.form.findFirst({
		where: {
			telegram_user_id: ctx.from.id,
		},
	});

	const searched = await prisma.form.findMany({
		where: {
			telegram_user_id: {
				not: user.telegram_user_id,
			},

			age: {
				gt: user.age - 4,
				lt: user.age + 4,
			},
		},
	});

	const activeSearch = await prisma.activeSearch.update({
		where: {
			telegram_user_id: ctx.from.id,
		},

		data: {
			pagination: {
				increment: 1,
			},
		},
	});

	return [user, searched, activeSearch];
};

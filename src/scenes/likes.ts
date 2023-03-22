import { Scenes, Markup } from "telegraf";
import { prisma } from "../common/prisma";
import { CustomContext } from "../types/context";
import { Form } from "@prisma/client";
import reciprocitySend from "../helpers/reciprocitySend";

export const likes = new Scenes.BaseScene<CustomContext>("likes")
	.enter(async (ctx) => {
		const [user, pagination, likeForm] = await getCurrectForm(ctx, false);

		if (!user) {
			await ctx.reply("*Вы не создали анкету!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		if (!likeForm) {
			await ctx.reply("*На данный момент нет активных анкет!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		await ctx.reply(
			`*Анкета №${pagination + 1}*\n\n` +
				`Имя: \`${likeForm.name}\`\n` +
				`Возраст: \`${likeForm.age}\`\n` +
				`Описание: \`${likeForm.description}\``,

			{
				parse_mode: "Markdown",
				...Markup.keyboard([["💗", "▶️"], ["💤"]]),
			}
		);
	})

	.hears("💗", async (ctx) => {
		let [user, pagination, likeForm] = await getCurrectForm(ctx, false);

		await prisma.form.update({
			where: {
				telegram_user_id: likeForm.telegram_user_id,
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
				form_id: likeForm.id,
			},
		});

		const checkLike = await prisma.like.findFirst({
			where: {
				telegram_user_id: likeForm.telegram_user_id,
				form_id: user.id,
			},
		});

		await ctx.reply("*Вы успешно поставили лайк пользователю!*", {
			parse_mode: "Markdown",
		});

		if (checkLike) {
			await reciprocitySend(ctx, user, likeForm, userLike.id, checkLike.id);
		}

		[user, pagination, likeForm] = await getCurrectForm(ctx);

		if (!likeForm) {
			ctx.reply("*Нет доступных анкет для дальнейшего сёрфинга!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		await ctx.reply(
			`*Анкета №${pagination + 1}*\n\n` +
				`Имя: \`${likeForm.name}\`\n` +
				`Возраст: \`${likeForm.age}\`\n` +
				`Описание: \`${likeForm.description}\``,

			{
				parse_mode: "Markdown",
				...Markup.keyboard([["💗", "▶️"], ["💤"]]),
			}
		);
	})

	.hears("▶️", async (ctx) => {
		const [, pagination, likeForm] = await getCurrectForm(ctx);

		if (!likeForm) {
			await ctx.reply("*На данный момент нет активных анкет!*", {
				parse_mode: "Markdown",
			});

			return ctx.scene.enter("start");
		}

		await ctx.reply(
			`*Анкета №${pagination + 1}*\n\n` +
				`Имя: \`${likeForm.name}\`\n` +
				`Возраст: \`${likeForm.age}\`\n` +
				`Описание: \`${likeForm.description}\``,

			{
				parse_mode: "Markdown",
				...Markup.keyboard([["💗", "▶️"], ["💤"]]),
			}
		);
	})

	.hears("💤", (ctx) => ctx.scene.enter("start"));

const getCurrectForm = async (
	ctx: CustomContext,
	update: boolean = true
): Promise<[Form, number, Form]> => {
	const user = await prisma.form.findFirst({
		where: {
			telegram_user_id: ctx.from.id,
		},
	});

	const searched = await prisma.like.findMany({
		where: {
			form_id: user.id,
		},
	});

	const activeSearch = await prisma.activeSearch.upsert({
		where: {
			telegram_user_id: ctx.from.id,
		},

		update: {
			likes_pagination: {
				increment: update ? 1 : 0,
			},
		},

		create: {
			telegram_user_id: ctx.from.id,
		},
	});

	if (searched.length === 0) {
		return [user, activeSearch.likes_pagination, null];
	}

	const likeForm = await prisma.form.findFirst({
		where: {
			telegram_user_id:
				searched[activeSearch.likes_pagination].telegram_user_id,
		},
	});

	return [user, activeSearch.likes_pagination, likeForm];
};

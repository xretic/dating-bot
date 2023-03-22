import { CustomContext } from "../types/context";
import { Form } from "@prisma/client";
import { prisma } from "../common/prisma";
import checkUsername from "./checkUsername";

export default async function (
	ctx: CustomContext,
	user: Form,
	mutual: Form,
	userLikeId: string,
	mutualLikeId: string
): Promise<void> {
	const [telegramUser, mutualUser] = await Promise.all([
		await ctx.telegram.getChatMember(
			Number(user.chat_id),
			Number(user.chat_id)
		),

		await ctx.telegram.getChatMember(
			Number(mutual.chat_id),
			Number(mutual.chat_id)
		),
	]);

	const [userCheck, mutualCheck] = await Promise.all([
		await checkUsername(ctx, Number(user.chat_id), telegramUser),
		await checkUsername(ctx, Number(mutual.chat_id), mutualUser),
	]);

	if ([userCheck, mutualCheck].some((x) => x === 403)) {
		return;
	}

	await ctx.telegram.sendMessage(
		Number(user.chat_id),
		`*У вас взаимный лайк! Можете начинать общение -* @${mutualUser.user.username}`,
		{
			parse_mode: "Markdown",
		}
	);

	await ctx.telegram.sendMessage(
		Number(mutual.chat_id),
		`*У вас взаимный лайк! Можете начинать общение -* @${telegramUser.user.username}`,
		{
			parse_mode: "Markdown",
		}
	);

	await prisma.like.delete({
		where: {
			id: userLikeId,
		},
	});

	await prisma.like.delete({
		where: {
			id: mutualLikeId,
		},
	});
}

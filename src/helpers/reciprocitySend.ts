import { CustomContext } from "../types/context";
import { Form } from "@prisma/client";
import { prisma } from "../common/prisma";
import checkUsername from "./checkUsername";

export default async function (
	ctx: CustomContext,
	users: { user: Form; likeId: string }[]
): Promise<void> {
	const chatMembers = await Promise.all(
		users.map((x) => {
			return ctx.telegram.getChatMember(
				Number(x.user.chat_id),
				Number(x.user.chat_id)
			);
		})
	);

	for (let i = 0; i < 2; i++) {
		await checkUsername(ctx, Number(users[i - 1]), chatMembers[i - 1]);
	}

	for (const user of users) {
		const chatMember = chatMembers.filter(
			(x) => x.user.id === Number(user.user.telegram_user_id)
		)[0];

		const checkResult = await checkUsername(
			ctx,
			Number(user.user.chat_id),
			chatMember
		);

		if (checkResult === 403) return;

		const mutualMember = chatMembers.filter(
			(x) => x.user.id !== Number(user.user.telegram_user_id)
		)[0];

		await ctx.telegram.sendMessage(
			Number(user.user.chat_id),
			`*У вас взаимный лайк! Можете начинать общение -* @${mutualMember.user.username}`,
			{
				parse_mode: "Markdown",
			}
		);

		await prisma.like.delete({
			where: {
				id: user.likeId,
			},
		});
	}
}

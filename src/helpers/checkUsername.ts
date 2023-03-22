import { ChatMember } from "telegraf/typings/core/types/typegram";
import { CustomContext } from "../types/context";

export default async function (
	ctx: CustomContext,
	chatId: number,
	user: ChatMember
): Promise<void | 403> {
	if (!user.user.username) {
		await ctx.telegram.sendMessage(
			chatId,
			"*Ваша анкета удалена! Причина: у вас не установлено имя пользователя*",
			{
				parse_mode: "Markdown",
			}
		);
		return 403;
	}
}

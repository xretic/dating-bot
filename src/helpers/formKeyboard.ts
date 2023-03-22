import { Form } from "@prisma/client";
import { Markup } from "telegraf";
import { ReplyKeyboardMarkup } from "telegraf/typings/core/types/typegram";

export default function (
	user: Form | null
): Markup.Markup<ReplyKeyboardMarkup> {
	if (!user) {
		return Markup.keyboard(["✏️ Создать"]);
	}

	return Markup.keyboard([["📑 Просмотреть", "✏️ Редактировать"]]);
}

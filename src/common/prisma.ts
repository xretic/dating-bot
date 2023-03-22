import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDatabase() {
	await prisma
		.$connect()
		.then(async () => {
			await prisma.$disconnect();
		})
		.catch(async (error: Error) => {
			await prisma.$disconnect();
			throw new Error(error.message);
		});
}

export {};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			TELEGRAM_TOKEN: string;
		}
	}
}

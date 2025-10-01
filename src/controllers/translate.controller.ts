import { Bot, Context, SessionFlavor, session, InlineKeyboard } from "grammy";
import { TranslateService, TargetLanguageCode } from "../services/translate.service.js";

type Stage = "idle" | "awaitingLanguage";

interface SessionData {
  stage: Stage;
  pendingText?: string;
}
type MyContext = Context & SessionFlavor<SessionData>;

function initialSession(): SessionData {
    return { stage: "idle" };
}

const LANG_BUTTONS: Array<{ title: string; code: TargetLanguageCode }> = [
  { title: "Английский", code: TargetLanguageCode.en },
  { title: "Немецкий", code: TargetLanguageCode.de },
  { title: "Японский", code: TargetLanguageCode.ja },
  { title: "Китайский", code: TargetLanguageCode.zh },
];
const languageKeyboard = new InlineKeyboard(
  LANG_BUTTONS.map(({ title, code }) => [{ text: title, callback_data: `lang:${code}` }])
);

export class TranslateController {
  telegramBot;

  constructor(
    TELEGRAM_BOT_TOKEN: string,
    private readonly translateService: TranslateService
  ) {
    this.telegramBot = new Bot<MyContext>(TELEGRAM_BOT_TOKEN);
    this.translateService = translateService;

    this.telegramBot.use(session({ initial: initialSession }));

    this.registerHandlers();
  }

  private registerHandlers() {
    this.telegramBot.command("start", async (ctx) => {
      ctx.session.stage = "idle";
      ctx.session.pendingText = undefined;
      await ctx.reply(
        "Привет! Отправь текст, который нужно перевести. После этого я предложу выбрать язык.",
      );
    });

    this.telegramBot.on("message:text", async (ctx) => {
      const text = ctx.message.text?.trim();
      if (!text) return;

      ctx.session.pendingText = text;
      ctx.session.stage = "awaitingLanguage";

      await ctx.reply(
        "На какой язык перевести? Пожалуйста, выбери один из вариантов:",
        { reply_markup: languageKeyboard }
      );
    });

    this.telegramBot.callbackQuery(/^lang:([a-z]{2})$/, async (ctx) => {
      await ctx.answerCallbackQuery();

      const match = ctx.match as RegExpMatchArray | null;
      const codeRaw = match && match[1];

      if (!ctx.session.pendingText) {
        await ctx.reply("Сначала отправьте текст для перевода командой или сообщением.");
        ctx.session.stage = "idle";
        return;
      }

      const target = codeRaw as TargetLanguageCode | undefined;
      if (!target || !(target in TargetLanguageCode)) {
        await ctx.reply("Не удалось определить язык. Попробуйте снова.");
        return;
      }

      const sourceText = ctx.session.pendingText;
      const { data: translatedText, error } = await this.translateService.translate({
        text: sourceText,
        targetLanguageCode: target,
      });

      if (error || !translatedText) {
        await ctx.reply(`Ошибка перевода: ${String(error ?? "unknown error")}`);
      } else {
        await ctx.reply(translatedText);
      }

      ctx.session.stage = "idle";
      ctx.session.pendingText = undefined;
    });
  }

  async start() {
    console.log("The bot listens to messages...");

    try {
      this.telegramBot.start();
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
    }
  
    process.once("SIGINT", () => this.telegramBot.stop());
    process.once("SIGTERM", () => this.telegramBot.stop());
  }
}
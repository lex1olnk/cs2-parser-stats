import path from "path";

const DEMO_SERVER_URL = process.env.DEMO_SERVER_URL || "http://localhost:3001";

export class DemoParserService {
  async parseDemo(
    sessionId: string,
    matchUrl: string,
    tournamentId: string | null,
    demoPath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Sending demo to parser: ${demoPath}`);

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const callbackUrl = `${baseUrl}/api/parse/callback?sessionId=${sessionId}&matchUrl=${encodeURIComponent(matchUrl)}${tournamentId ? "&tournamentId=" + tournamentId : ""}`;

      console.log(`📞 Callback URL: ${callbackUrl}`);

      // ✅ Отправляем только имя файла, а демо-сервер сам построит путь
      const fileName = path.basename(demoPath);

      const response = await fetch(`${DEMO_SERVER_URL}/parse-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileName, // ТОЛЬКО имя файла
          callbackUrl: callbackUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Demo server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log(`✅ Demo sent to parser successfully`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Parse failed for ${matchUrl}:`, error);
      return { success: false };
    }
  }
}

export const demoParserService = new DemoParserService();

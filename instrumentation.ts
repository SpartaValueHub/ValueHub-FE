export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { installChatWsProxy } = await import("./lib/chat/ws-proxy");
    installChatWsProxy();
  }
}

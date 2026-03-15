import { StreamChat } from "stream-chat";

let serverClient;

export const getStreamClient = () => {
  if (!serverClient) {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in .env");
    }

    serverClient = StreamChat.getInstance(apiKey, apiSecret);
  }
  return serverClient;
};

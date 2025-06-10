export type MessageHandler = (event: any) => void;

export function createMessageHandler(trpcHandler: MessageHandler): MessageHandler {
  return (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Handle console messages (optional - can be removed for production)
      if (data.type === 'console') {
        console.log(`[WebView ${data.level}]:`, data.message);
        return;
      }

      // Route to tRPC handler
      trpcHandler(event);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
}
// telegram-webapp.d.ts
interface Window {
  Telegram?: {
    WebApp: {
      initData: string;
      initDataUnsafe: Record<string, any>;
      version: string;
      ready: () => void;
      expand: () => void;
      close: () => void;
    };
  };
}

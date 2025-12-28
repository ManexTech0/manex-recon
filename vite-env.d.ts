// Removed reference to vite/client which was causing type errors
// /// <reference types="vite/client" />

declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

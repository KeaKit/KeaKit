type LogoutCallback = () => Promise<void>;
let onUnauthorized: LogoutCallback | null = null;

export function setUnauthorizedHandler(cb: LogoutCallback) {
  onUnauthorized = cb;
}

export function getUnauthorizedHandler() {
  return onUnauthorized;
}
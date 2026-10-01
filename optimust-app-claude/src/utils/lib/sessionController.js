// sessionController.js

let controller = new AbortController();
let sessionExpired = false;

export const getSessionSignal = () => controller.signal;

export const isSessionExpired = () => sessionExpired;

export const expireSession = () => {
  if (sessionExpired) return false;

  sessionExpired = true;
  controller.abort();

  return true;
};

export const resetSession = () => {
  sessionExpired = false;
  controller = new AbortController();
};

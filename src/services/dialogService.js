let _handler = null;

export function _registerDialogHandler(fn) {
  _handler = fn;
}

export const dialog = {
  toast(message, type = "info") {
    _handler?.({ kind: "toast", message, toastType: type });
  },
  confirm(message, title) {
    return new Promise((resolve) => {
      if (_handler) _handler({ kind: "confirm", message, title, resolve });
      else resolve(false);
    });
  },
  prompt(message, defaultValue = "", title) {
    return new Promise((resolve) => {
      if (_handler) _handler({ kind: "prompt", message, defaultValue, title, resolve });
      else resolve(null);
    });
  },
};

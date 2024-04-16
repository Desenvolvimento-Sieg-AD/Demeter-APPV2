import { toast, type ToastOptions } from 'vue3-toastify';

const logOnConsole = true;
const autoClose = 3000;

const options: ToastOptions = {
  autoClose: autoClose,
  pauseOnHover: true,
  closeOnClick: true,
  pauseOnFocusLoss: true,
}

export default function useToast() {
  const warn = (message: string) => {
    toast.warn(message, options);
    if (logOnConsole) console.warn(message);
  }

  const success = (message: string) => {
    toast.success(message, options);
    if (logOnConsole) console.log(message);
  }

  const error = (message: string) => {
    toast.error(message, options);
    console.error(message);
  }

  const info = (message: string) => {
    toast.info(message, options);
    console.log(message);
    if (logOnConsole) console.log(message);
  }
  
  const done = (message: string) => {
    toast.success(message, options);
    if (logOnConsole) console.log(message);
  }

  return { warn, success, error, info, done }
}
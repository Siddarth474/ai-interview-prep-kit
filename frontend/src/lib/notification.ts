import { toast } from "@/components/ui/toast";

export const notify = {
  success: (message: string, title: string = "Success") => {
    return toast.add({
      type: "success",
      title,
      description: message,
      timeout: 4000,
    });
  },
  error: (message: string, title: string = "Error") => {
    return toast.add({
      type: "error",
      title,
      description: message,
      timeout: 5000,
    });
  },
};

export const notifySuccess = notify.success;
export const notifyError = notify.error;
export default notify;

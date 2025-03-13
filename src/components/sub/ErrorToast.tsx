import { toast } from "sonner";
import { errorMessages } from "@/constants/errortypes";

export const handleError = (error: { type?: string; message?: string }) => {
  if (!error?.type) {
    toast.error("An unexpected error occurred.", {
      style: {
        background: "red",
        color: "#FFFFFF",
      },
    });
    return;
  }

  const message = errorMessages[error.type as keyof typeof errorMessages] ?? "An unexpected error occurred.";
  toast.error(message, {
    style: {
      background: "red",
      color: "#FFFFFF",
    },
  });
};


export const handleSuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: "#3CE7B2",
      color: "#FFFFFF",
    },
  });
};

export const handleInfo = (error: { type?: string; message?: string }) => {
  if (!error?.type) {
    toast.info("An unexpected error occurred.", {
      style: {
        background: "gray",
        color: "#FFFFFF",
      },
    });
    return;
  }

  const message = errorMessages[error.type as keyof typeof errorMessages] ?? "An unexpected error occurred.";
  console.log(message);
  toast.info(message, {
    style: {
      background: "gray",
      color: "#FFFFFF",
    },
  });
};
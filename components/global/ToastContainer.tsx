import { toast, Toaster, Toast } from "react-hot-toast";

// Toaster container component
export const ToasterContainer: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: "#333",
          color: "#fff",
        },
      }}
    />
  );
};

// Global toast ID (ensures only one toast is shown at a time)
let toastId: string | undefined = undefined;

export const SuccessToast = (message: string) => {
  if (toastId) toast.dismiss(toastId); // OK now
  toastId = toast.success(message) as string; // cast to string
};

export const ErrorToast = (message: string) => {
  if (toastId) toast.dismiss(toastId);
  toastId = toast.error(message) as string;
};


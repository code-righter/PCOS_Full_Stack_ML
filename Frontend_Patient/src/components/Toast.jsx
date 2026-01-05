import { CheckCircle, XCircle } from "lucide-react";

const Toast = ({ toast }) => {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-lg border
        ${
          isSuccess
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}

        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
};

export default Toast;

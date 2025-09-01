import { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-6 relative">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 p-2 rounded-xl"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

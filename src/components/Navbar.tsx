import { FiMonitor, FiRefreshCw, FiPlus } from "react-icons/fi";

interface NavbarProps {
  onReset: () => void;
}

export default function Navbar({ onReset }: NavbarProps) {
  return (
    <div className="navbar bg-base-300 shadow-lg mb-8 rounded-b-lg">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">
          <FiMonitor className="mr-2 text-primary" /> Yönetim Paneli
        </a>
      </div>
      <div className="flex-none gap-2">
        <button className="btn btn-outline btn-warning mr-2" onClick={onReset}>
          <FiRefreshCw className="mr-2" /> Verileri Sıfırla
        </button>

        <button
          className="btn btn-primary"
          onClick={() =>
            (
              document.getElementById("add_modal") as HTMLDialogElement
            )?.showModal()
          }
        >
          <FiPlus className="mr-2 text-lg" /> Yeni Kayıt Ekle
        </button>
      </div>
    </div>
  );
}

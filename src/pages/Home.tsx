import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import type { User } from "../interfaces/User";
import { FiEdit, FiTrash2, FiSave, FiX } from "react-icons/fi";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
  });

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
  });

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const localData = localStorage.getItem("users");
        if (localData) {
          setUsers(JSON.parse(localData));
          setLoading(false);
        } else {
          const response = await axios.get<User[]>(
            "https://jsonplaceholder.typicode.com/users",
          );
          setUsers(response.data);
          localStorage.setItem("users", JSON.stringify(response.data));
          setLoading(false);
        }
      } catch (error) {
        console.error("Veri çekilirken kritik hata:", error);
        setError("Veriler yüklenemedi.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. SİLME (Delete)
  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm(
      "Bu kaydı silmek istediğinize emin misiniz?",
    );
    if (isConfirmed) {
      try {
        if (id <= 10) {
          await axios.delete(
            `https://jsonplaceholder.typicode.com/users/${id}`,
          );
        } else {
          console.log("Kayıt silindi.");
        }

        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));
      } catch (error) {
        console.error("Silme işlemi başarısız:", error);
      }
    }
  };

  // 3. EKLEME
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newUserPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: { name: formData.companyName },
      };
      await axios.post<User>(
        "https://jsonplaceholder.typicode.com/users",
        newUserPayload,
      );

      const nextId =
        users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const guaranteedNewUser: User = { id: nextId, ...newUserPayload };

      const updatedUsers = [...users, guaranteedNewUser];
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      setFormData({ name: "", email: "", phone: "", companyName: "" });
      const modal = document.getElementById("add_modal") as HTMLDialogElement;
      if (modal) modal.close();
    } catch (error) {
      console.error("Ekleme hatası:", error);
    }
  };

  // 4. GÜNCELLEME MODALI
  const openEditModal = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      companyName: user.company?.name || "",
    });

    const modal = document.getElementById("edit_modal") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  // 5. GÜNCELLEMEYİ KAYDETME
  const handleUpdate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingUserId === null) return;

    try {
      const updatedPayload = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        company: { name: editFormData.companyName },
      };

      // API'ye güncelleme isteği
      if (editingUserId <= 10) {
        await axios.put(
          `https://jsonplaceholder.typicode.com/users/${editingUserId}`,
          updatedPayload,
        );
      } else {
        console.log("Kayıt güncellendi.");
      }

      const updatedUsers = users.map((user) =>
        user.id === editingUserId ? { ...user, ...updatedPayload } : user,
      );

      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      const modal = document.getElementById("edit_modal") as HTMLDialogElement;
      if (modal) modal.close();
      setEditingUserId(null);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Kayıt güncellenemedi.");
    }
  };

  // RESETLEME BUTONU

  const handleReset = async () => {
    const isConfirmed = window.confirm(
      "Tüm yerel veriler silinecek ve tablo ilk haline dönecek. Emin misiniz?",
    );

    if (isConfirmed) {
      setLoading(true);
      localStorage.removeItem("users");

      try {
        const response = await axios.get<User[]>(
          "https://jsonplaceholder.typicode.com/users",
        );

        setUsers(response.data);
        localStorage.setItem("users", JSON.stringify(response.data));

        setLoading(false);
      } catch (error) {
        console.error("Sıfırlama hatası:", error);
        alert("Veriler geri yüklenirken bir hata oluştu.");
        setLoading(false);
      }
    }
  };

  let content;

  if (loading) {
    content = (
      <div className="flex justify-center mt-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  } else if (error) {
    content = (
      <div className="alert alert-error mt-10 shadow-lg">
        <span>{error}</span>
      </div>
    );
  } else {
    content = (
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-xl">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-300 text-base-content">
              <th>ID</th>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Telefon</th>
              <th>Şirket</th>
              <th className="text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover">
                <th>{user.id}</th>
                <td className="font-bold">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className="badge badge-ghost font-medium">
                    {user.company?.name || "Belirtilmedi"}
                  </span>
                </td>
                <td className="flex justify-center gap-2">
                  <button
                    className="btn btn-sm btn-info text-white"
                    onClick={() => openEditModal(user)}
                  >
                    <FiEdit />
                    Düzenle
                  </button>
                  <button
                    className="btn btn-sm btn-error text-white"
                    onClick={() => handleDelete(user.id)}
                  >
                    <FiTrash2 /> Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 relative">
      <div className="container mx-auto">
        <Navbar onReset={handleReset} />
        {content}
      </div>

      {/* --- EKLEME MODALI --- */}
      <dialog id="add_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Yeni Kayıt Ekle</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ad Soyad"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="E-posta"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Telefon"
              className="input input-bordered w-full"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Şirket Adı"
              className="input input-bordered w-full"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
            />
            <div className="modal-action mt-2">
              <button
                type="button"
                className="btn btn-error text-white"
                onClick={() =>
                  (
                    document.getElementById("add_modal") as HTMLDialogElement
                  )?.close()
                }
              >
                <FiX className="mr-1" />
                İptal
              </button>
              <button type="submit" className="btn btn-primary">
                <FiSave className="mr-1" />
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* --- GÜNCELLEME MODALI --- */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4 text-info">Kaydı Düzenle</h3>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ad Soyad"
              className="input input-bordered w-full"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="E-posta"
              className="input input-bordered w-full"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Telefon"
              className="input input-bordered w-full"
              value={editFormData.phone}
              onChange={(e) =>
                setEditFormData({ ...editFormData, phone: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Şirket Adı"
              className="input input-bordered w-full"
              value={editFormData.companyName}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  companyName: e.target.value,
                })
              }
              required
            />
            <div className="modal-action mt-2">
              <button
                type="button"
                className="btn btn-error text-white"
                onClick={() =>
                  (
                    document.getElementById("edit_modal") as HTMLDialogElement
                  )?.close()
                }
              >
                <FiX className="mr-1" />
                İptal
              </button>
              <button type="submit" className="btn btn-info text-white">
                <FiSave className="mr-1" />
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

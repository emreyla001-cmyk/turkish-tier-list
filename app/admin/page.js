import AdminGuard from '../components/AdminGuard';

export default function AdminHome() {
  return (
    <AdminGuard>
      <div className="wrap">
        <h1>Admin Paneli</h1>
        <div className="grid">
          <a href="/admin/karakterler" className="card">
            <h3>Karakterler</h3>
            <p>Karakter ekle, düzenle, yayınla</p>
          </a>
          <a href="/admin/oneriler" className="card">
            <h3>Kullanıcı Önerileri</h3>
            <p>Bekleyen karakter önerilerini onayla veya reddet</p>
          </a>
          <a href="/admin/kullanicilar" className="card">
            <h3>Kullanıcılar</h3>
            <p>Moderatör, VIP ve admin rollerini yönet</p>
          </a>
        </div>
      </div>
    </AdminGuard>
  );
}

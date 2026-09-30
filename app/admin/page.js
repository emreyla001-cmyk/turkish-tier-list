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
            <h3>👥 Kullanıcılar & Moderasyon</h3>
            <p>Moderatör, VIP ve admin rollerini yönet, ceza ver</p>
          </a>
          <a href="/admin/magaza" className="card">
            <h3>🛍️ Mağaza & Fiyat Yönetimi</h3>
            <p>Kozmetiklerin ve GIF haklarının altın fiyatlarını düzenle</p>
          </a>
          <a href="/admin/cekilis" className="card">
            <h3>🎡 Çarkıfelek & Ödül Oranları</h3>
            <p>Hediye çarkındaki ödülleri ve kazanma olasılıklarını (%2 vb.) ayarla</p>
          </a>
          <a href="/admin/etkinlikler" className="card">
            <h3>🎮 Etkinlikler & Mini Oyunlar</h3>
            <p>Karakter bilmece ve VS quiz oyunlarını dilediğin an aç/kapat</p>
          </a>
        </div>
      </div>
    </AdminGuard>
  );
}

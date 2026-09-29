import AdminGuard from '../../../components/AdminGuard';
import CharacterForm from '../../../components/CharacterForm';

export default function NewCharacterPage() {
  return (
    <AdminGuard>
      <div className="wrap">
        <h1>Yeni Karakter</h1>
        <CharacterForm />
      </div>
    </AdminGuard>
  );
}

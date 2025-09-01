import { signOut } from "../auth/authService";

export default function SettingsPage() {
  return (
    <div className="p-4 space-y-6">
      {/* Informations sur l'application */}
      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">À propos</h2>
        <p className="text-sm text-gray-600">
          Carnet de Bébé v1.0 – Une application pour faciliter la communication entre parents et crèches 👶.
        </p>
      </section>

      {/* Cookies */}
      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Cookies</h2>
        <p className="text-sm text-gray-600">Informations sur l’utilisation des cookies.</p>
      </section>

      {/* Télécharger données */}
      <section className="bg-white rounded-2xl shadow p-4 space-y-2">
        <h2 className="text-lg font-semibold">Compte</h2>
        <button className="bg-gray-200 w-full p-3 rounded-xl">Télécharger mes données</button>
        <button className="bg-gray-200 w-full p-3 rounded-xl">Modifier mon mot de passe</button>
        <button className="bg-red-500 text-white w-full p-3 rounded-xl">Supprimer mon compte</button>
        <button
          className="bg-blue-500 text-white w-full p-3 rounded-xl"
          onClick={() => signOut()}
        >
          Déconnexion
        </button>
      </section>
    </div>
  );
}

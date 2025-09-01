export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-100 rounded-xl p-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
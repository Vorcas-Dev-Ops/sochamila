export default function VendorDashboard() {
  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Vendor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card title="Assigned Orders" value="12" />
        <Card title="Pending Dispatch" value="4" />
        <Card title="Completed Orders" value="38" />

      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}

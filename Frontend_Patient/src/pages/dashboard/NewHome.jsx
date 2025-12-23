export default function NewHome() {
  const rows = [
    {
      id: 1,
      dateLabel: "Mon, 22 Dec 2025",
      submittedAgo: "2 hours ago",
      status: "Pending",
      cycle: { cycleLength: "32 days", lastPeriod: "10 Dec 2025", flow: "Moderate", pain: "Mild", weight: "62 kg", height: "165 cm", bmi: "22.8" },
      vitals: { spo2: "98%", heartRate: "76 bpm", bp: "110/70", temp: "98.4°F", notes: "Mild cramps, mood swings" }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar stays as in your current UI */}

      <main className="flex-1 px-8 py-6 bg-slate-50">
        {/* Top: greeting + calendar */}
        <div className="flex gap-6 mb-6">
          {/* Greeting */}
          <section className="flex-1 bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-3xl font-semibold text-slate-900">
              Welcome back, Abhijeet
            </h1>
            <p className="mt-2 text-slate-500">
              Track your PCOS symptoms, cycle and consultation history in one place.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm">
                Cycle Day: 12
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-sm">
                Next appointment: 24 Dec, 5:00 PM
              </span>
            </div>
          </section>

          {/* Calendar */}
          <section className="w-80 bg-[#F5E8FF] rounded-2xl shadow-sm p-4">
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-800">Cycle Calendar</h2>
              <div className="flex gap-1 text-slate-500">
                <button>{"<"}</button>
                <button>{">"}</button>
              </div>
            </header>
            {/* Replace with actual calendar component */}
            <div className="aspect-square bg-white rounded-xl p-3">
              {/* calendar grid here */}
            </div>
            <div className="mt-3 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Cycle days
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" /> Doctor requests
              </div>
            </div>
          </section>
        </div>

        {/* Previous requests */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Previous Doctor Requests
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  <th className="px-4 py-3">Sr No</th>
                  <th className="px-4 py-3">Day – Date</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(row => (
                  <RequestRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function RequestRow({ row }) {
  const [open, setOpen] = React.useState(false);
  const statusColors = {
    Pending: "bg-amber-50 text-amber-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-rose-50 text-rose-700"
  };

  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-3 text-slate-700">{row.id}</td>
        <td className="px-4 py-3 text-slate-700">{row.dateLabel}</td>
        <td className="px-4 py-3 text-slate-500">{row.submittedAgo}</td>
        <td className="px-4 py-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
            {row.status}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1 text-indigo-600 text-xs font-medium"
          >
            {open ? "Hide" : "View"} details
            <span className={`transform transition ${open ? "rotate-180" : ""}`}>⌄</span>
          </button>
        </td>
      </tr>

      {open && (
        <tr className="bg-slate-50/60">
          <td colSpan={5} className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <h3 className="text-slate-700 font-semibold mb-2">Cycle & Body</h3>
                <InfoRow label="Cycle length" value={row.cycle.cycleLength} />
                <InfoRow label="Last period" value={row.cycle.lastPeriod} />
                <InfoRow label="Flow" value={row.cycle.flow} />
                <InfoRow label="Pain level" value={row.cycle.pain} />
                <InfoRow label="Weight" value={row.cycle.weight} />
                <InfoRow label="Height" value={row.cycle.height} />
                <InfoRow label="BMI" value={row.cycle.bmi} />
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-3">
                <h3 className="text-slate-700 font-semibold mb-2">Vitals</h3>
                <InfoRow label="SPO2" value={row.vitals.spo2} />
                <InfoRow label="Heart rate" value={row.vitals.heartRate} />
                <InfoRow label="Blood pressure" value={row.vitals.bp} />
                <InfoRow label="Temperature" value={row.vitals.temp} />
                <InfoRow label="Notes" value={row.vitals.notes} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

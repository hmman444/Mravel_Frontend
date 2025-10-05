const tabs = [
  { id: "summary", label: "Summary" },
  { id: "list", label: "List" },
  { id: "board", label: "Board" },
  { id: "timeline", label: "Timeline" },
  { id: "pages", label: "Pages" },
];

export default function PlanTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-3 text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

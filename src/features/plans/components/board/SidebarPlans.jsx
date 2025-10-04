import {
  FaChevronLeft,
  FaFolderOpen,
  FaPlus,
  FaHotel,
  FaUtensils,
  FaMapMarkerAlt,
  FaRegSmile,
} from "react-icons/fa";
import { useState } from "react";

export default function SidebarPlans({
  onSelectPlan,
  activePlanId,
  collapsed,
  onAddToPlan, // ✅ callback khi click 1 lần
}) {
  const [openSections, setOpenSections] = useState({
    forYou: true,
    plans: true,
  });
  const [selectedItem, setSelectedItem] = useState(null); // ✅ hiển thị modal chi tiết

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ✅ Mock dữ liệu mẫu
  const hotelList = [
    {
      id: "h1",
      name: "Dalat Wonder Resort",
      description: "Resort ven hồ Tuyền Lâm tuyệt đẹp với không gian yên bình.",
      image: "https://picsum.photos/300/200?hotel",
      address: "Tuyền Lâm, Đà Lạt",
      price: "1.200.000đ/đêm",
    },
    {
      id: "h2",
      name: "Terracotta Hotel",
      description: "Khách sạn sang trọng giữa rừng thông, view hồ lãng mạn.",
      image: "https://picsum.photos/300/201?terracotta",
      address: "Phường 3, TP Đà Lạt",
      price: "1.000.000đ/đêm",
    },
  ];

  const restaurantList = [
    {
      id: "r1",
      name: "Nhà hàng Memory",
      description: "Ẩm thực Việt kết hợp không gian hoài cổ giữa lòng Đà Lạt.",
      image: "https://picsum.photos/300/202?restaurant",
      address: "26B Huỳnh Thúc Kháng, Đà Lạt",
      price: "200.000đ/người",
    },
    {
      id: "r2",
      name: "Bánh căn Lệ",
      description: "Món ngon dân dã nổi tiếng địa phương.",
      image: "https://picsum.photos/300/203?banhcan",
      address: "27 Yersin, Đà Lạt",
      price: "50.000đ/người",
    },
  ];

  const locationList = [
    {
      id: "l1",
      name: "Thung lũng Tình Yêu",
      description: "Điểm du lịch nổi tiếng, cảnh quan tuyệt đẹp và lãng mạn.",
      image: "https://picsum.photos/300/204?lovevalley",
      address: "7 Mai Anh Đào, Đà Lạt",
      price: "100.000đ/vé",
    },
    {
      id: "l2",
      name: "Hồ Xuân Hương",
      description: "Biểu tượng trung tâm thành phố, điểm check-in không thể bỏ lỡ.",
      image: "https://picsum.photos/300/205?hoxuanhuong",
      address: "Trung tâm Đà Lạt",
      price: "Miễn phí",
    },
  ];

  const plans = [
    { id: "1", name: "Chuyến đi Đà Lạt 3N2Đ" },
    { id: "2", name: "Khám phá Hà Nội cuối tuần" },
  ];

  // ✅ Hàm xử lý click 1 lần & 2 lần
  let clickTimer = null;
  const handleClickItem = (item) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      setSelectedItem(item); // 👉 double click => mở chi tiết
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        onAddToPlan?.(item); // 👉 single click => thêm vào PlanList
      }, 250);
    }
  };

  return (
    <aside
      className={`border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-[width] duration-300 ease-in-out overflow-hidden ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="h-full overflow-y-auto px-2 py-3 scrollbar-thin">
        {/* For you */}
        <Section
          title="For you"
          icon={<FaRegSmile />}
          open={openSections.forYou}
          toggle={() => toggleSection("forYou")}
          collapsed={collapsed}
        >
          <SidebarCategory
            icon={<FaHotel />}
            label="Khách sạn"
            items={hotelList}
            onItemClick={handleClickItem}
          />
          <SidebarCategory
            icon={<FaUtensils />}
            label="Quán ăn"
            items={restaurantList}
            onItemClick={handleClickItem}
          />
          <SidebarCategory
            icon={<FaMapMarkerAlt />}
            label="Địa điểm"
            items={locationList}
            onItemClick={handleClickItem}
          />
        </Section>

        {/* Plans */}
        <Section
          title="Plans"
          icon={<FaFolderOpen />}
          open={openSections.plans}
          toggle={() => toggleSection("plans")}
          collapsed={collapsed}
          action={
            !collapsed && (
              <button className="text-gray-400 hover:text-primary text-xs flex items-center gap-1">
                <FaPlus /> New
              </button>
            )
          }
        >
          <div className="space-y-1 pl-2">
            {plans.map((plan) => (
              <SidebarItem
                key={plan.id}
                label={plan.name}
                icon={<FaFolderOpen />}
                active={activePlanId === plan.id}
                onClick={() => onSelectPlan(plan)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* Modal chi tiết */}
      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </aside>
  );
}

/* ==== CÁC COMPONENT PHỤ ==== */
function Section({ title, icon, open, toggle, collapsed, children, action }) {
  return (
    <div className="mb-2">
      <div
        className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        onClick={toggle}
      >
        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          {icon}
          {!collapsed && <span>{title}</span>}
        </span>
        {!collapsed && (
          <span className="flex items-center gap-2">
            {action}
            <span
              className={`transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            >
              <FaChevronLeft size={12} />
            </span>
          </span>
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {open && <div className="pt-1">{children}</div>}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, collapsed, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-2 rounded-md px-2 py-2 text-sm transition ${
        active
          ? "bg-primary text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

function SidebarCategory({ icon, label, items, onItemClick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <div
        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>

      {open && (
        <div className="ml-6 mt-1 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-20 object-cover rounded-md mb-1"
              />
              <p className="text-xs font-semibold">{item.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==== Modal chi tiết ==== */
function ItemDetailModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[420px] max-w-[90vw] p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        >
          ✕
        </button>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-100">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.description}</p>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>📍 {item.address}</p>
          <p>💰 {item.price}</p>
        </div>
      </div>
    </div>
  );
}

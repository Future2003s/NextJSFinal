"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

const CATEGORIES = ["Hoa giấy", "Hoa vải", "Phụ kiện", "Vật tư đóng gói"] as const;
const UNITS = ["bộ", "thùng", "cuộn", "kg"] as const;
const WAREHOUSE_ZONES = [
  "Kệ A1",
  "Kệ A2",
  "Kệ A3",
  "Kệ B1",
  "Kệ B2",
  "Khu đóng gói",
] as const;
const SUPPLIERS = [
  "Xưởng Thủ Đức",
  "Đối tác Bình Dương",
  "Cơ sở Nam Định",
  "Công ty Bao Bì Số 3",
] as const;

type Category = (typeof CATEGORIES)[number];
type Unit = (typeof UNITS)[number];
type WarehouseZone = (typeof WAREHOUSE_ZONES)[number];
type Supplier = (typeof SUPPLIERS)[number];

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: Category;
  unit: Unit;
  quantity: number;
  minQuantity: number;
  location: WarehouseZone;
  supplier: Supplier;
  updatedAt: string;
  incomingQuantity?: number;
  inboundDate?: string;
  note?: string;
};

type ReceiptStatus = "Đang đặt" | "Đang vận chuyển" | "Hoàn tất" | "Đang xác nhận";

type ReceiptPlan = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  eta: string;
  supplier: Supplier;
  status: ReceiptStatus;
};

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "SP-1001",
    sku: "HX-01",
    name: "Hoa nhỏ vàng 5 tầng",
    category: "Hoa giấy",
    unit: "bộ",
    quantity: 640,
    minQuantity: 420,
    location: "Kệ A3",
    supplier: "Xưởng Thủ Đức",
    updatedAt: "2025-11-14",
    incomingQuantity: 180,
    inboundDate: "2025-11-20",
    note: "Hàng quay nhanh, kiểm tra mỗi ca.",
  },
  {
    id: "SP-1002",
    sku: "HX-02",
    name: "Hoa trung đỏ",
    category: "Hoa giấy",
    unit: "bộ",
    quantity: 280,
    minQuantity: 360,
    location: "Kệ B1",
    supplier: "Đối tác Bình Dương",
    updatedAt: "2025-11-12",
    incomingQuantity: 500,
    inboundDate: "2025-11-22",
    note: "Đang chờ nguyên liệu từ nhà cung cấp.",
  },
  {
    id: "SP-1003",
    sku: "HX-03",
    name: "Hoa dài xanh lá",
    category: "Hoa vải",
    unit: "bộ",
    quantity: 150,
    minQuantity: 200,
    location: "Kệ A1",
    supplier: "Cơ sở Nam Định",
    updatedAt: "2025-11-09",
    note: "Ưu tiên cho đơn hàng Tết Dương.",
  },
  {
    id: "SP-1004",
    sku: "PK-01",
    name: "Phụ kiện ghép hoa",
    category: "Phụ kiện",
    unit: "thùng",
    quantity: 90,
    minQuantity: 70,
    location: "Kệ B2",
    supplier: "Công ty Bao Bì Số 3",
    updatedAt: "2025-11-11",
  },
  {
    id: "SP-1005",
    sku: "VT-10",
    name: "Cuộn giấy nền 48mm",
    category: "Vật tư đóng gói",
    unit: "cuộn",
    quantity: 410,
    minQuantity: 320,
    location: "Khu đóng gói",
    supplier: "Đối tác Bình Dương",
    updatedAt: "2025-11-13",
    incomingQuantity: 200,
    inboundDate: "2025-11-25",
  },
];

const INITIAL_RECEIPTS: ReceiptPlan[] = [
  {
    id: "PO-568",
    sku: "HX-02",
    name: "Hoa trung đỏ",
    quantity: 500,
    eta: "2025-11-22",
    supplier: "Đối tác Bình Dương",
    status: "Đang vận chuyển",
  },
  {
    id: "PO-573",
    sku: "HX-05",
    name: "Hoa nhí pastel",
    quantity: 320,
    eta: "2025-11-19",
    supplier: "Xưởng Thủ Đức",
    status: "Đang đặt",
  },
  {
    id: "PO-577",
    sku: "PK-01",
    name: "Phụ kiện ghép hoa",
    quantity: 120,
    eta: "2025-11-18",
    supplier: "Công ty Bao Bì Số 3",
    status: "Hoàn tất",
  },
];

type NewEntryState = {
  sku: string;
  name: string;
  category: Category;
  unit: Unit;
  quantity: string;
  minQuantity: string;
  location: WarehouseZone;
  supplier: Supplier;
  inboundDate: string;
  note: string;
};

const NEW_ENTRY_TEMPLATE: NewEntryState = {
  sku: "",
  name: "",
  category: CATEGORIES[0],
  unit: UNITS[0],
  quantity: "0",
  minQuantity: "100",
  location: WAREHOUSE_ZONES[0],
  supplier: SUPPLIERS[0],
  inboundDate: "",
  note: "",
};

const STOCK_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "danger", label: "Thiếu hàng" },
  { value: "warning", label: "Cần theo dõi" },
  { value: "safe", label: "Ổn định" },
] as const;

type StockFilterValue = (typeof STOCK_FILTER_OPTIONS)[number]["value"];

type Filters = {
  query: string;
  category: "all" | Category;
  status: StockFilterValue;
};

type StockLevelMeta = {
  key: "safe" | "warning" | "danger";
  label: string;
  description: string;
  badgeClass: string;
  textClass: string;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.max(0, Number.isFinite(value) ? value : 0));

const formatDate = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const getStockLevel = (item: InventoryItem): StockLevelMeta => {
  if (!item.minQuantity) {
    return {
      key: "warning",
      label: "Chưa có định mức",
      description: "Cập nhật ngưỡng tối thiểu",
      badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
      textClass: "text-slate-600",
    };
  }
  const ratio = item.quantity / item.minQuantity;
  if (ratio <= 1) {
    return {
      key: "danger",
      label: "Thiếu hàng",
      description: "Cần nhập ngay",
      badgeClass: "bg-red-50 text-red-700 border border-red-200",
      textClass: "text-red-600",
    };
  }
  if (ratio <= 1.3) {
    return {
      key: "warning",
      label: "Cần theo dõi",
      description: "Sắp chạm định mức",
      badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      textClass: "text-amber-600",
    };
  }
  return {
    key: "safe",
    label: "Ổn định",
    description: "Tồn kho an toàn",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    textClass: "text-emerald-600",
  };
};

const receiptBadgeClass = (status: ReceiptStatus) => {
  switch (status) {
    case "Đang vận chuyển":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "Đang đặt":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Hoàn tất":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [receipts, setReceipts] = useState<ReceiptPlan[]>(INITIAL_RECEIPTS);
  const [filters, setFilters] = useState<Filters>({ query: "", category: "all", status: "all" });
  const [newEntry, setNewEntry] = useState<NewEntryState>(() => ({ ...NEW_ENTRY_TEMPLATE }));
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const isEditingInventory = Boolean(editingItemId);

  const summary = useMemo(() => {
    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventory.filter((item) => getStockLevel(item).key !== "safe").length;
    const inboundQuantity = inventory.reduce(
      (sum, item) => sum + (item.incomingQuantity ?? 0),
      0
    );
    return { totalProducts, totalQuantity, lowStockCount, inboundQuantity };
  }, [inventory]);

  const latestUpdate = useMemo(() => {
    if (!inventory.length) return "";
    const latestTimestamp = inventory.reduce((latest, item) => {
      const time = new Date(item.updatedAt).getTime();
      return time > latest ? time : latest;
    }, 0);
    return latestTimestamp ? new Date(latestTimestamp).toISOString() : "";
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return inventory.filter((item) => {
      if (filters.category !== "all" && item.category !== filters.category) return false;
      if (filters.status !== "all" && getStockLevel(item).key !== filters.status) return false;
      if (!query) return true;
      const combined = `${item.name} ${item.sku} ${item.supplier}`.toLowerCase();
      return combined.includes(query);
    });
  }, [filters, inventory]);

  const lowStockItems = useMemo(() => {
    const items = inventory.filter((item) => getStockLevel(item).key !== "safe");
    return items.sort((a, b) => {
      const ratioA = a.minQuantity ? a.quantity / a.minQuantity : 1;
      const ratioB = b.minQuantity ? b.quantity / b.minQuantity : 1;
      return ratioA - ratioB;
    });
  }, [inventory]);
  const editingItem = editingItemId
    ? inventory.find((item) => item.id === editingItemId) ?? null
    : null;

  const handleNewEntryChange = <K extends keyof NewEntryState>(key: K, value: NewEntryState[K]) => {
    setNewEntry((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ query: "", category: "all", status: "all" });
  };

  const handleNewEntrySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(newEntry.quantity);
    const minQuantity = Number(newEntry.minQuantity);

    if (!newEntry.name.trim()) {
      setFormMessage({ type: "error", text: "Vui lòng nhập tên sản phẩm." });
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormMessage({ type: "error", text: "Số lượng nhập phải lớn hơn 0." });
      return;
    }
    if (!Number.isFinite(minQuantity) || minQuantity <= 0) {
      setFormMessage({ type: "error", text: "Vui lòng thiết lập định mức tối thiểu hợp lệ." });
      return;
    }

    const sku = newEntry.sku.trim() || `NEW-${Date.now().toString(36).toUpperCase()}`;
    const baseInfo = {
      sku,
      name: newEntry.name.trim(),
      category: newEntry.category,
      unit: newEntry.unit,
      quantity,
      minQuantity,
      location: newEntry.location,
      supplier: newEntry.supplier,
      updatedAt: new Date().toISOString(),
      incomingQuantity: newEntry.inboundDate ? quantity : undefined,
      inboundDate: newEntry.inboundDate || undefined,
      note: newEntry.note.trim() || undefined,
    };

    if (editingItemId) {
      setInventory((prev) =>
        prev.map((item) => (item.id === editingItemId ? { ...item, ...baseInfo } : item))
      );
      setFormMessage({ type: "success", text: "Đã cập nhật thông tin tồn kho." });
      setEditingItemId(null);
    } else {
      const newItem: InventoryItem = {
        id: `SP-${Date.now().toString(36)}`,
        ...baseInfo,
      };

      setInventory((prev) => [newItem, ...prev]);

      if (newEntry.inboundDate) {
        const newReceipt: ReceiptPlan = {
          id: `PO-${(receipts.length + 1).toString().padStart(3, "0")}`,
          sku,
          name: newItem.name,
          quantity,
          eta: newEntry.inboundDate,
          supplier: newEntry.supplier,
          status: "Đang xác nhận",
        };
        setReceipts((prev) => [newReceipt, ...prev]);
      }

      setFormMessage({ type: "success", text: "Đã tạo phiếu nhập và cập nhật tồn kho." });
    }

    setNewEntry({ ...NEW_ENTRY_TEMPLATE });
  };

  const handleInventoryEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setNewEntry({
      sku: item.sku,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: String(item.quantity),
      minQuantity: String(item.minQuantity),
      location: item.location,
      supplier: item.supplier,
      inboundDate: item.inboundDate ?? "",
      note: item.note ?? "",
    });
    setFormMessage(null);
  };

  const handleInventoryDelete = (id: string) => {
    const target = inventory.find((item) => item.id === id);
    const confirmed = typeof window !== "undefined"
      ? window.confirm(`Xóa ${target?.name ?? "mặt hàng"} khỏi danh sách tồn kho?`)
      : true;
    if (!confirmed) return;

    setInventory((prev) => prev.filter((item) => item.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
      setNewEntry({ ...NEW_ENTRY_TEMPLATE });
    }
  };

  const handleCancelEditInventory = () => {
    setEditingItemId(null);
    setNewEntry({ ...NEW_ENTRY_TEMPLATE });
    setFormMessage(null);
  };
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trung tâm vận hành kho
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý tồn kho & kế hoạch nhập hàng
          </h1>
          <p className="text-base text-slate-600">
            Theo dõi số liệu tồn kho, cảnh báo định mức và ghi nhận phiếu nhập ngay tại một nơi,
            hoàn toàn bằng tiếng Việt cho đội kho vận.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Mặt hàng đang quản lý</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{summary.totalProducts}</p>
            <p className="text-sm text-slate-500">SKU hoạt động</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng tồn kho</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatNumber(summary.totalQuantity)}
            </p>
            <p className="text-sm text-slate-500">Đơn vị gồm bộ/thùng/cuộn</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Cần xử lý gấp</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{summary.lowStockCount}</p>
            <p className="text-sm text-slate-500">SKU dưới định mức</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Số lượng đang nhập</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {formatNumber(summary.inboundQuantity)}
            </p>
            <p className="text-sm text-slate-500">Dự kiến về trong 7 ngày</p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tra cứu tồn kho nhanh</h2>
              <p className="text-sm text-slate-500">
                Lọc theo mã SKU, danh mục hoặc trạng thái cảnh báo.
              </p>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Từ khóa</label>
              <input
                value={filters.query}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, query: event.target.value }))
                }
                placeholder="Nhập tên sản phẩm, mã SKU hoặc nhà cung cấp"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-inner focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Danh mục</label>
              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: event.target.value as Filters["category"],
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                <option value="all">Tất cả</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Trạng thái tồn</label>
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value as Filters["status"],
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                {STOCK_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Danh sách tồn kho</h2>
              <p className="text-sm text-slate-500">
                Hiển thị {filteredInventory.length} / {inventory.length} SKU
              </p>
            </div>
            {latestUpdate && (
              <p className="text-xs text-slate-500">
                Cập nhật mới nhất: {formatDate(latestUpdate)}
              </p>
            )}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="text-xs uppercase text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Sản phẩm</th>
                  <th className="pb-3 pr-4 font-semibold">Tồn & định mức</th>
                  <th className="pb-3 pr-4 font-semibold">Trạng thái</th>
                  <th className="pb-3 pr-4 font-semibold">Nhà cung cấp</th>
                  <th className="pb-3 pr-4 font-semibold">Vị trí</th>
                  <th className="pb-3 pr-4 font-semibold">Nhập mới</th>
                  <th className="pb-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const level = getStockLevel(item);
                  return (
                    <tr key={item.id} className="align-top">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          SKU: {item.sku} · {item.category}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-900">
                          {formatNumber(item.quantity)} {item.unit}
                        </p>
                        <p className="text-xs text-slate-500">
                          Định mức: {formatNumber(item.minQuantity)} {item.unit}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${level.badgeClass}`}
                        >
                          {level.label}
                        </span>
                        <p className={`mt-1 text-xs ${level.textClass}`}>{level.description}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-900">{item.supplier}</p>
                        <p className="text-xs text-slate-500">
                          Cập nhật: {formatDate(item.updatedAt)}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-900">{item.location}</p>
                        <p className="text-xs text-slate-500">{item.note ? item.note : "--"}</p>
                      </td>
                      <td className="py-4 pr-4">
                        {item.incomingQuantity ? (
                          <>
                            <p className="font-semibold text-slate-900">
                              +{formatNumber(item.incomingQuantity)} {item.unit}
                            </p>
                            <p className="text-xs text-slate-500">
                              Dự kiến: {formatDate(item.inboundDate)}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Chưa có kế hoạch</p>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleInventoryEdit(item)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInventoryDelete(item.id)}
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:text-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-sm font-medium text-slate-500"
                    >
                      Không tìm thấy mặt hàng nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cảnh báo tồn kho</h2>
                <p className="text-sm text-slate-500">
                  {lowStockItems.length
                    ? `${lowStockItems.length} mặt hàng cần xử lý`
                    : "Kho đang trong trạng thái an toàn."}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {lowStockItems.length === 0 && (
                <p className="text-sm text-slate-500">
                  Chưa có cảnh báo. Hãy tiếp tục duy trì lịch nhập hàng đều đặn.
                </p>
              )}
              {lowStockItems.map((item) => {
                const level = getStockLevel(item);
                const suggestedQuantity = Math.max(
                  Math.round(item.minQuantity * 1.3 - item.quantity),
                  50
                );
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.category} · SKU {item.sku}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${level.badgeClass}`}
                      >
                        {level.label}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-500">Tồn thực tế</p>
                        <p className="font-semibold text-slate-900">
                          {formatNumber(item.quantity)} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Định mức tối thiểu</p>
                        <p className="font-semibold text-slate-900">
                          {formatNumber(item.minQuantity)} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Đề xuất nhập</p>
                        <p className="font-semibold text-red-600">
                          {formatNumber(Math.max(suggestedQuantity, 0))} {item.unit}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Gợi ý: Lên đơn bổ sung tối thiểu {formatNumber(Math.max(suggestedQuantity, 0))} {item.unit} cho {item.supplier}
                      {item.inboundDate
                        ? ` · Đang chờ hàng về ngày ${formatDate(item.inboundDate)}`
                        : ""} để đảm bảo sản xuất.
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Nhập kho nhanh</h2>
            <p className="text-sm text-slate-500">
              Ghi nhận khi hàng vào kho, hệ thống tự động cập nhật cảnh báo và kế hoạch nhập.
            </p>
            {isEditingInventory && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p>
                  Đang chỉnh sửa:{" "}
                  <span className="font-semibold">{editingItem?.name ?? "mặt hàng"}</span> (
                  {editingItem?.sku ?? "SKU tạm"})
                </p>
                <p className="text-xs text-amber-700">
                  Sau khi lưu, toàn bộ số liệu tồn kho sẽ được cập nhật theo thông tin mới.
                </p>
              </div>
            )}
            <form className="mt-4 space-y-4" onSubmit={handleNewEntrySubmit}>
              <div>
                <label className="text-sm font-medium text-slate-700">Tên sản phẩm</label>
                <input
                  value={newEntry.name}
                  onChange={(event) => handleNewEntryChange("name", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  placeholder="Ví dụ: Hoa trung đỏ lô mới"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Mã SKU</label>
                  <input
                    value={newEntry.sku}
                    onChange={(event) => handleNewEntryChange("sku", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                    placeholder="Tùy chọn"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Danh mục</label>
                  <select
                    value={newEntry.category}
                    onChange={(event) =>
                      handleNewEntryChange("category", event.target.value as Category)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Số lượng nhập</label>
                  <input
                    type="number"
                    min={0}
                    value={newEntry.quantity}
                    onChange={(event) => handleNewEntryChange("quantity", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Đơn vị</label>
                  <select
                    value={newEntry.unit}
                    onChange={(event) =>
                      handleNewEntryChange("unit", event.target.value as Unit)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Định mức tối thiểu</label>
                  <input
                    type="number"
                    min={0}
                    value={newEntry.minQuantity}
                    onChange={(event) => handleNewEntryChange("minQuantity", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Ngày nhận dự kiến</label>
                  <input
                    type="date"
                    value={newEntry.inboundDate}
                    onChange={(event) => handleNewEntryChange("inboundDate", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Vị trí lưu kho</label>
                  <select
                    value={newEntry.location}
                    onChange={(event) =>
                      handleNewEntryChange("location", event.target.value as WarehouseZone)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    {WAREHOUSE_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Nhà cung cấp</label>
                  <select
                    value={newEntry.supplier}
                    onChange={(event) =>
                      handleNewEntryChange("supplier", event.target.value as Supplier)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    {SUPPLIERS.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Ghi chú nội bộ</label>
                <textarea
                  value={newEntry.note}
                  onChange={(event) => handleNewEntryChange("note", event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  placeholder="Thông tin thêm cho ca sau..."
                />
              </div>
              {formMessage && (
                <p
                  className={`text-sm ${
                    formMessage.type === "success" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formMessage.text}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {isEditingInventory ? "Cập nhật tồn kho" : "Lưu phiếu nhập"}
                </button>
                {isEditingInventory && (
                  <button
                    type="button"
                    onClick={handleCancelEditInventory}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Kế hoạch nhập hàng</h2>
              <p className="text-sm text-slate-500">
                {receipts.length} lịch nhận đang được theo dõi.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{receipt.name}</p>
                    <p className="text-xs text-slate-500">
                      {receipt.sku} · {receipt.supplier}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${receiptBadgeClass(
                      receipt.status
                    )}`}
                  >
                    {receipt.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Khối lượng</p>
                    <p className="font-semibold text-slate-900">{formatNumber(receipt.quantity)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ngày về dự kiến</p>
                    <p className="font-semibold text-slate-900">{formatDate(receipt.eta)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Ghi chú: Kiểm tra chất lượng khi nhập và cập nhật hệ thống ngay sau khi hoàn tất.
                </p>
              </div>
            ))}
            {receipts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Chưa có kế hoạch nhập hàng nào. Tạo mới bên mục “Nhập kho nhanh”.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

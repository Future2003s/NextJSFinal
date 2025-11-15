"use client";

import React, { useEffect, useMemo, useState } from "react";

type FlowerLayer = {
  width: number;
  length: number;
  pieces: number;
};

type Flower = {
  id: string;
  name: string;
  setsPerBox: number;
  finishedFlowersPerBox: number;
  layers: FlowerLayer[];
};

const formatNumber = (value: number) => {
  if (Number.isNaN(value) || typeof value !== "number") {
    value = 0;
  }
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatIntegerInput = (value: number) => {
  if (typeof value !== "number" || Number.isNaN(value) || value === 0) {
    return "";
  }
  return new Intl.NumberFormat("vi-VN").format(value);
};

const parseFormattedInput = (raw: string) => {
  if (!raw) return 0;
  return Number(raw.replace(/\./g, "")) || 0;
};

const FLOWER_DATA = {
  hoa_nho_td: {
    id: "hoa_nho_td",
    name: "HOA NHỎ TRẮNG ĐỎ 5 TẦNG",
    setsPerBox: 200,
    finishedFlowersPerBox: 20,
    layers: [
      { width: 18, length: 76, pieces: 1200 },
      { width: 24, length: 73, pieces: 1200 },
      { width: 24, length: 69, pieces: 600 },
      { width: 24, length: 65, pieces: 600 },
    ],
  },
  hoa_nho_vh: {
    id: "hoa_nho_vh",
    name: "HOA NHỎ VÀNG HỒNG 5 TẦNG",
    setsPerBox: 200,
    finishedFlowersPerBox: 20,
    layers: [
      { width: 24, length: 76, pieces: 1200 },
      { width: 24, length: 73, pieces: 1200 },
      { width: 24, length: 69, pieces: 600 },
      { width: 24, length: 65, pieces: 600 },
    ],
  },
  hoa_trung: {
    id: "hoa_trung",
    name: "HOA TRUNG 5 TẦNG",
    setsPerBox: 100,
    finishedFlowersPerBox: 12,
    layers: [
      { width: 36, length: 99, pieces: 600 },
      { width: 36, length: 95, pieces: 800 },
      { width: 36, length: 88, pieces: 300 },
      { width: 24, length: 76, pieces: 300 },
    ],
  },
  hoa_dai_td: {
    id: "hoa_dai_td",
    name: "HOA ĐẠI TRẮNG ĐỎ 6 TẦNG",
    setsPerBox: 100,
    finishedFlowersPerBox: 6,
    layers: [
      { width: 32, length: 126, pieces: 600 },
      { width: 48, length: 122, pieces: 600 },
      { width: 48, length: 115, pieces: 300 },
      { width: 36, length: 103, pieces: 300 },
      { width: 32, length: 88, pieces: 300 },
      { width: 24, length: 76, pieces: 300 },
    ],
  },
  hoa_dai_vh: {
    id: "hoa_dai_vh",
    name: "HOA ĐẠI VÀNG HỒNG 6 TẦNG",
    setsPerBox: 100,
    finishedFlowersPerBox: 6,
    layers: [
      { width: 36, length: 126, pieces: 600 },
      { width: 48, length: 122, pieces: 600 },
      { width: 48, length: 115, pieces: 300 },
      { width: 36, length: 103, pieces: 300 },
      { width: 36, length: 88, pieces: 300 },
      { width: 24, length: 76, pieces: 300 },
    ],
  },
} as const satisfies Record<string, Flower>;

type FlowerId = keyof typeof FLOWER_DATA;
const ALL_ROLL_WIDTHS = [18, 24, 32, 36, 48] as const;
type RollWidth = (typeof ALL_ROLL_WIDTHS)[number];

const useMaterialNeeds = (selectedFlowerId: string) => {
  return useMemo(() => {
    const needs: Partial<Record<RollWidth, number>> = {};
    const flower = FLOWER_DATA[selectedFlowerId as FlowerId];
    if (!flower) return {};

    for (const width of ALL_ROLL_WIDTHS) {
      const layers = flower.layers.filter((layer) => layer.width === width);
      if (!layers.length) continue;
      const totalLength = layers.reduce(
        (sum, layer) => sum + layer.pieces * layer.length,
        0
      );
      needs[width] = totalLength / 1000;
    }

    return needs;
  }, [selectedFlowerId]);
};
const FormattedInput = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => {
  const [displayValue, setDisplayValue] = useState(formatIntegerInput(value));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFormattedInput(event.target.value);

    if (!Number.isNaN(parsed) && parsed <= 10_000_000) {
      setDisplayValue(formatIntegerInput(parsed));
      onChange(parsed);
    } else if (event.target.value === "") {
      setDisplayValue("");
      onChange(0);
    }
  };

  useEffect(() => {
    setDisplayValue(formatIntegerInput(value));
  }, [value]);

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
      />
    </div>
  );
};

const CustomSelect = ({
  id,
  label,
  value,
  onChange,
  children,
}: React.PropsWithChildren<{
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}>) => (
  <div className="w-full">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
    >
      {children}
    </select>
  </div>
);
const TabInventoryResults = ({
  inventory,
  onInventoryChange,
}: {
  inventory: Record<RollWidth, { quantity: number; metersPerRoll: number }>;
  onInventoryChange: (
    next: Record<RollWidth, { quantity: number; metersPerRoll: number }>
  ) => void;
}) => {
  const [selectedFlowerId, setSelectedFlowerId] = useState("");
  const materialNeedsPerBox = useMaterialNeeds(selectedFlowerId);

  const handleInventoryChange = (
    width: RollWidth,
    field: "quantity" | "metersPerRoll",
    value: number
  ) => {
    onInventoryChange({
      ...inventory,
      [width]: {
        ...inventory[width],
        [field]: value,
      },
    });
  };

  const calculationResult = useMemo(() => {
    const flower = FLOWER_DATA[selectedFlowerId as FlowerId];
    if (!flower || Object.keys(materialNeedsPerBox).length === 0) {
      return {
        totalBoxes: 0,
        limitingFactor: null as RollWidth | null,
        totalFlowers: 0,
        finishedBoxes: 0,
      };
    }

    let maxBoxes = Infinity;
    let limitingFactor: RollWidth | null = null;

    for (const width of ALL_ROLL_WIDTHS) {
      const metersNeeded = materialNeedsPerBox[width] ?? 0;
      if (metersNeeded <= 0) continue;
      const inventoryItem = inventory[width] ?? {
        quantity: 0,
        metersPerRoll: 0,
      };
      const availableMeters =
        inventoryItem.quantity * inventoryItem.metersPerRoll;

      if (availableMeters === 0) {
        maxBoxes = 0;
        limitingFactor = width;
        break;
      }

      const boxesPossible = availableMeters / metersNeeded;
      if (boxesPossible < maxBoxes) {
        maxBoxes = boxesPossible;
        limitingFactor = width;
      }
    }

    const totalBoxes = maxBoxes === Infinity ? 0 : Math.floor(maxBoxes);
    const totalFlowers = totalBoxes * flower.setsPerBox;
    const finishedBoxes =
      flower.finishedFlowersPerBox > 0
        ? totalFlowers / flower.finishedFlowersPerBox
        : 0;

    return { totalBoxes, limitingFactor, totalFlowers, finishedBoxes };
  }, [selectedFlowerId, inventory, materialNeedsPerBox]);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <div className="space-y-6 p-6 border border-gray-200 rounded-xl w-full">
        <h2 className="text-xl font-semibold text-gray-900">1. Nhập Tồn kho</h2>
        {ALL_ROLL_WIDTHS.map((width) => {
          const item = inventory[width] ?? { quantity: 0, metersPerRoll: 0 };
          return (
            <div key={width} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800">
                Cuộn Khổ {width}mm
              </h4>
              <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2">
                <FormattedInput
                  id={`width-${width}-quantity`}
                  label="Số cuộn"
                  value={item.quantity}
                  onChange={(value) =>
                    handleInventoryChange(width, "quantity", value)
                  }
                />
                <FormattedInput
                  id={`width-${width}-meters`}
                  label="Số mét / cuộn"
                  value={item.metersPerRoll}
                  onChange={(value) =>
                    handleInventoryChange(width, "metersPerRoll", value)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6 p-6 border border-gray-200 rounded-xl w-full">
        <h2 className="text-xl font-semibold text-gray-900">2. Xem Kết quả</h2>
        <CustomSelect
          id="flower-select-tab1"
          label="Chọn sản phẩm"
          value={selectedFlowerId}
          onChange={(event) => setSelectedFlowerId(event.target.value)}
        >
          <option value="" disabled>
            Chọn một loại hoa
          </option>
          {Object.values(FLOWER_DATA).map((flower) => (
            <option key={flower.id} value={flower.id}>
              {flower.name}
            </option>
          ))}
        </CustomSelect>

        {!selectedFlowerId ? (
          <p className="text-gray-500 text-center py-4">
            Vui lòng chọn sản phẩm.
          </p>
        ) : (
          <div className="space-y-5 pt-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500">
                Kết quả từ kho
              </h3>
              <p className="text-4xl font-bold text-orange-500">
                {formatNumber(calculationResult.totalFlowers)}{" "}
                <span className="text-2xl font-medium">bông</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-sm font-medium text-blue-700">
                  Hộp (Giai đoạn cắt)
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatNumber(calculationResult.totalBoxes)}{" "}
                  <span className="text-lg">hộp</span>
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-sm font-medium text-green-700">
                  Hộp (Hoàn thiện)
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {formatNumber(calculationResult.finishedBoxes)}{" "}
                  <span className="text-lg">hộp</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Nhu cầu (cho 1 hộp cắt)
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {Object.entries(materialNeedsPerBox).map(([width, meters]) => {
                  if (!meters) return null;
                  return (
                    <li key={width} className="flex justify-between">
                      <span>Khổ {width}mm:</span>
                      <span className="font-semibold">
                        {formatNumber(meters)} mét
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {calculationResult.limitingFactor && (
              <p className="text-sm text-center text-gray-600">
                Bị giới hạn bởi:{" "}
                <span className="font-semibold text-red-600">
                  Khổ {calculationResult.limitingFactor}mm
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const TabSinglePlanner = () => {
  const [selectedFlowerId, setSelectedFlowerId] = useState("");
  const [targetFlowers, setTargetFlowers] = useState(0);
  const [planningMetersPerRoll, setPlanningMetersPerRoll] = useState<
    Partial<Record<RollWidth, number>>
  >({});

  const selectedFlower = FLOWER_DATA[selectedFlowerId as FlowerId];
  const materialNeedsPerBox = useMaterialNeeds(selectedFlowerId);

  const requiredWidths = useMemo(() => {
    if (!selectedFlower) return [] as RollWidth[];
    const widths = selectedFlower.layers.map(
      (layer) => layer.width as RollWidth
    );
    return [...new Set(widths)].sort((a, b) => a - b) as RollWidth[];
  }, [selectedFlower]);

  const {
    setsPerBox = 0,
    finishedFlowersPerBox = 0,
    name,
  } = selectedFlower ?? {};
  const targetCuttingBoxes =
    targetFlowers > 0 && setsPerBox > 0
      ? Math.ceil(targetFlowers / setsPerBox)
      : 0;
  const targetFinishedBoxes =
    targetFlowers > 0 && finishedFlowersPerBox > 0
      ? targetFlowers / finishedFlowersPerBox
      : 0;

  const handleMetersPerRollChange = (width: RollWidth, value: number) => {
    setPlanningMetersPerRoll((prev) => ({
      ...prev,
      [width]: value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-6 border border-gray-200 rounded-xl">
      <div className="space-y-6">
        <CustomSelect
          id="flower-select-tab2"
          label="1. Chọn sản phẩm"
          value={selectedFlowerId}
          onChange={(event) => setSelectedFlowerId(event.target.value)}
        >
          <option value="" disabled>
            Chọn một loại hoa
          </option>
          {Object.values(FLOWER_DATA).map((flower) => (
            <option key={flower.id} value={flower.id}>
              {flower.name}
            </option>
          ))}
        </CustomSelect>

        {selectedFlower && (
          <div className="space-y-5 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              2. Nhập kế hoạch cho: {name}
            </h2>
            <FormattedInput
              id="target-flowers"
              label="Số lượng hoa muốn sản xuất"
              value={targetFlowers}
              onChange={setTargetFlowers}
            />

            {targetFlowers > 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-sm font-medium text-blue-700">
                      Hộp (Giai đoạn cắt)
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatNumber(targetCuttingBoxes)}{" "}
                      <span className="text-lg">hộp</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-sm font-medium text-green-700">
                      Hộp (Hoàn thiện)
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatNumber(targetFinishedBoxes)}{" "}
                      <span className="text-lg">hộp</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 pt-2">
                  Vật liệu yêu cầu
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {requiredWidths.map((width) => {
                    const totalMetersNeeded =
                      (materialNeedsPerBox[width] ?? 0) * targetCuttingBoxes;
                    const metersPerRoll = planningMetersPerRoll[width] ?? 0;
                    const totalRollsNeeded =
                      metersPerRoll > 0 ? totalMetersNeeded / metersPerRoll : 0;

                    return (
                      <div
                        key={width}
                        className="p-4 border border-gray-200 rounded-xl"
                      >
                        <p className="text-lg font-semibold text-gray-800">
                          Cuộn Khổ {width}mm
                        </p>
                        <p className="text-gray-700 mt-1">
                          Tổng số mét cần:{" "}
                          <span className="font-bold text-red-600">
                            {formatNumber(totalMetersNeeded)} mét
                          </span>
                        </p>
                        <div className="mt-3">
                          <FormattedInput
                            id={`planner-mpr-${width}`}
                            label="Nhập số mét / cuộn (chuẩn)"
                            value={metersPerRoll}
                            onChange={(value) =>
                              handleMetersPerRollChange(width, value)
                            }
                          />
                        </div>
                        {totalRollsNeeded > 0 && (
                          <p className="text-gray-700 mt-2">
                            Số cuộn cần (với {formatNumber(metersPerRoll)}{" "}
                            m/cuộn):{" "}
                            <span className="font-bold text-red-600">
                              {formatNumber(totalRollsNeeded)} cuộn
                            </span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const TabMasterPlanner = () => {
  const [targets, setTargets] = useState<Record<FlowerId, number>>(
    Object.fromEntries(Object.keys(FLOWER_DATA).map((id) => [id, 0])) as Record<
      FlowerId,
      number
    >
  );
  const [metersPerRoll, setMetersPerRoll] = useState<Record<RollWidth, number>>(
    Object.fromEntries(ALL_ROLL_WIDTHS.map((width) => [width, 0])) as Record<
      RollWidth,
      number
    >
  );

  const handleTargetChange = (flowerId: FlowerId, value: number) => {
    setTargets((prev) => ({ ...prev, [flowerId]: value }));
  };

  const handleMetersPerRollChange = (width: RollWidth, value: number) => {
    setMetersPerRoll((prev) => ({ ...prev, [width]: value }));
  };

  const plan = useMemo(() => {
    const totalMetersByWidth = Object.fromEntries(
      ALL_ROLL_WIDTHS.map((width) => [width, 0])
    ) as Record<RollWidth, number>;
    const totalFinishedBoxesByType = { Nhỏ: 0, Trung: 0, Đại: 0 };
    const breakdown: Record<
      FlowerId,
      {
        flowerName: string;
        targetFlowers: number;
        targetCuttingBoxes: number;
        targetFinishedBoxes: number;
        metersForThisFlower: Record<RollWidth, number>;
      }
    > = {} as Record<FlowerId, any>;

    for (const [flowerId, targetFlowers] of Object.entries(targets) as [
      FlowerId,
      number
    ][]) {
      if (targetFlowers <= 0) continue;
      const flower = FLOWER_DATA[flowerId];
      if (!flower) continue;

      const targetCuttingBoxes =
        flower.setsPerBox > 0
          ? Math.ceil(targetFlowers / flower.setsPerBox)
          : 0;
      const targetFinishedBoxes =
        flower.finishedFlowersPerBox > 0
          ? targetFlowers / flower.finishedFlowersPerBox
          : 0;
      const metersForThisFlower = Object.fromEntries(
        ALL_ROLL_WIDTHS.map((width) => [width, 0])
      ) as Record<RollWidth, number>;

      for (const layer of flower.layers) {
        const metersPerBox = (layer.pieces * layer.length) / 1000;
        const metersNeeded = metersPerBox * targetCuttingBoxes;
        totalMetersByWidth[layer.width as RollWidth] += metersNeeded;
        metersForThisFlower[layer.width as RollWidth] += metersNeeded;
      }

      if (flowerId.includes("nho"))
        totalFinishedBoxesByType.Nhỏ += targetFinishedBoxes;
      else if (flowerId.includes("trung"))
        totalFinishedBoxesByType.Trung += targetFinishedBoxes;
      else if (flowerId.includes("dai"))
        totalFinishedBoxesByType.Đại += targetFinishedBoxes;

      breakdown[flowerId] = {
        flowerName: flower.name,
        targetFlowers,
        targetCuttingBoxes,
        targetFinishedBoxes,
        metersForThisFlower,
      };
    }

    const totalRollsByWidth = Object.fromEntries(
      ALL_ROLL_WIDTHS.map((width) => {
        const totalMeters = totalMetersByWidth[width];
        const mpr = metersPerRoll[width];
        return [width, mpr > 0 ? totalMeters / mpr : 0];
      })
    ) as Record<RollWidth, number>;

    return {
      totalMetersByWidth,
      totalRollsByWidth,
      totalFinishedBoxesByType,
      breakdown,
    };
  }, [targets, metersPerRoll]);

  const hasTargets = Object.values(targets).some((value) => value > 0);

  return (
    <div className="max-w-3xl mx-auto w-full p-6 border border-gray-200 rounded-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          1. Nhập số lượng hoa muốn sản xuất
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.values(FLOWER_DATA).map((flower) => (
            <FormattedInput
              key={flower.id}
              id={`master-${flower.id}`}
              label={flower.name}
              value={targets[flower.id]}
              onChange={(value) => handleTargetChange(flower.id, value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          2. Nhập số mét / cuộn (chuẩn)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {ALL_ROLL_WIDTHS.map((width) => (
            <FormattedInput
              key={width}
              id={`master-mpr-${width}`}
              label={`Khổ ${width}mm`}
              value={metersPerRoll[width]}
              onChange={(value) => handleMetersPerRollChange(width, value)}
            />
          ))}
        </div>
      </div>

      {hasTargets && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tổng Hộp Hoàn Thiện (Dự kiến)
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(plan.totalFinishedBoxesByType).map(
                ([type, total]) => (
                  <div
                    key={type}
                    className="p-4 bg-green-100 border border-green-200 rounded-xl text-center"
                  >
                    <div className="text-sm font-medium text-green-800">
                      Hoa {type}
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatNumber(total)} hộp
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tổng Vật Liệu Cần
            </h3>
            <div className="space-y-4">
              {ALL_ROLL_WIDTHS.map((width) => {
                const totalMeters = plan.totalMetersByWidth[width];
                if (totalMeters === 0) return null;
                const totalRolls = plan.totalRollsByWidth[width];

                return (
                  <div
                    key={width}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    <p className="text-lg font-semibold text-gray-800">
                      Cuộn Khổ {width}mm
                    </p>
                    <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                      <li>
                        Tổng số mét cần:{" "}
                        <span className="font-bold text-red-600">
                          {formatNumber(totalMeters)} mét
                        </span>
                      </li>
                      {metersPerRoll[width] > 0 && (
                        <li>
                          Số cuộn cần (với {formatNumber(metersPerRoll[width])}{" "}
                          m/cuộn):{" "}
                          <span className="font-bold text-red-600">
                            {formatNumber(totalRolls)} cuộn
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Chi tiết (Tách mục)
            </h3>
            <div className="space-y-3">
              {Object.values(plan.breakdown).map((item) => (
                <div
                  key={item.flowerName}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <p className="text-lg font-semibold text-gray-700">
                    {item.flowerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Mục tiêu: {formatIntegerInput(item.targetFlowers)} bông ={" "}
                    {formatNumber(item.targetFinishedBoxes)} hộp hoàn thiện
                  </p>
                  <ul className="mt-2 list-disc list-inside text-gray-700">
                    {Object.entries(item.metersForThisFlower).map(
                      ([width, meters]) => {
                        if (!meters) return null;
                        return (
                          <li key={width}>
                            Khổ {width}mm:{" "}
                            <span className="font-semibold">
                              {formatNumber(meters)} mét
                            </span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default function App() {
  const [activeTab, setActiveTab] = useState<
    "inventory" | "singlePlan" | "masterPlan"
  >("inventory");
  const [inventory, setInventory] = useState<
    Record<RollWidth, { quantity: number; metersPerRoll: number }>
  >(
    Object.fromEntries(
      ALL_ROLL_WIDTHS.map((width) => [width, { quantity: 0, metersPerRoll: 0 }])
    ) as Record<
      RollWidth,
      {
        quantity: number;
        metersPerRoll: number;
      }
    >
  );

  const tabs = [
    { id: "inventory", label: "Kho & Kết quả" },
    { id: "singlePlan", label: "Kế hoạch (Đơn lẻ)" },
    { id: "masterPlan", label: "Kế hoạch (Tổng)" },
  ] as const;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-6 lg:p-8 font-sans">
      <header className="mb-8 max-w-5xl mx-auto text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Trình Quản lý Sản xuất Hoa
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Phân tích & lập kế hoạch vật liệu theo thời gian thực
        </p>
      </header>

      <div className="max-w-7xl mx-auto mb-8 border-b border-gray-300 flex flex-wrap gap-2 sm:gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold text-base transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto space-y-8">
        {activeTab === "inventory" && (
          <TabInventoryResults
            inventory={inventory}
            onInventoryChange={setInventory}
          />
        )}
        {activeTab === "singlePlan" && <TabSinglePlanner />}
        {activeTab === "masterPlan" && <TabMasterPlanner />}
      </main>
    </div>
  );
}

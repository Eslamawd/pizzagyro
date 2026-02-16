export const normalizeCoordinate = (value) => {
  const numericValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const normalizeUSLongitude = (value) => {
  const numericValue = normalizeCoordinate(value);
  if (numericValue === null) return null;
  if (numericValue > 0 && numericValue <= 180) return -numericValue;
  return numericValue;
};

export const normalizePhoneDigits = (value) =>
  (value || "").toString().replace(/\D/g, "");

export const normalizeUSPhone = (value) => {
  const digits = normalizePhoneDigits(value);
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
};

export const isValidUSPhone = (value) => {
  const normalized = normalizeUSPhone(value);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(normalized);
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusMiles = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
};

export const calculateItemTotal = (item, selectedOptions = {}) => {
  let total = Number(item.price || 0);

  if (item.options_grouped) {
    Object.entries(item.options_grouped).forEach(([groupKey, options]) => {
      const selected = selectedOptions[groupKey];
      if (!selected) return;

      const getToppingPrice = (originalPrice) => {
        let price = Number(originalPrice || 0);
        if (groupKey === "topping" || groupKey === "extra") {
          const currentSize = selectedOptions.size?.name?.toLowerCase() || "";
          if (currentSize === "m" || currentSize === "medium") price += 0.25;
          else if (currentSize === "l" || currentSize === "large") price += 0.5;
          else if (currentSize.includes("xl")) price += 0.75;
        }
        return price;
      };

      const selectedArray = Array.isArray(selected) ? selected : [selected];
      selectedArray.forEach((optionObj) => {
        if (!optionObj) return;
        const targetId =
          typeof optionObj === "object" ? optionObj.id : optionObj;
        const option = options.find((value) => value.id == targetId);
        if (option) total += getToppingPrice(option.price);
      });
    });
  }

  return total.toFixed(2);
};

export const buildOptionDetails = (selectedOptions) => {
  const optionDetails = {};

  Object.entries(selectedOptions).forEach(([groupKey, value]) => {
    if (!value) return;

    if (typeof value === "number") {
      optionDetails[groupKey] = {
        id: value,
        position: "whole",
        name: value.name,
        price: value.price,
      };
      return;
    }

    if (Array.isArray(value)) {
      optionDetails[groupKey] = value.map((option) => ({
        id: option.id,
        position: option.position || "whole",
        price: Number(option?.price || 0),
        name: option.name,
      }));
      return;
    }

    if (value?.id) {
      optionDetails[groupKey] = {
        id: value.id,
        name: value.name,
        price: Number(value?.price || 0),
        position: value.position || "whole",
      };
    }
  });

  return optionDetails;
};

export const buildOptionsKey = (selectedOptions) =>
  Object.entries(selectedOptions)
    .map(([key, value]) => {
      if (!value) return `${key}:none`;
      if (Array.isArray(value))
        return `${key}:${value.map((entry) => entry?.id || "none").join("-")}`;
      if (typeof value === "object") return `${key}:${value.id || "none"}`;
      return `${key}:${value}`;
    })
    .join("|");

export const formatOrderItems = (cart) =>
  cart.map((item) => {
    const formattedOptions = [];

    if (item.options) {
      Object.values(item.options).forEach((option) => {
        if (Array.isArray(option)) {
          option.forEach((entry) => {
            formattedOptions.push({
              id: entry.id,
              position: entry.position || "whole",
            });
          });
        } else if (option?.id) {
          formattedOptions.push({
            id: option.id,
            position: option.position || "whole",
          });
        }
      });
    }

    return {
      item_id: item.item_id || parseInt(item.id, 10),
      quantity: item.qty,
      price: item.price,
      options: formattedOptions,
    };
  });

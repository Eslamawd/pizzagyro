export const OPTION_GROUP_CONFIG = {
  size: { type: "single", required: true },
  dough: { type: "single", required: true },
  sauce: { type: "single", required: true },
  filling: { type: "single", required: false },
  spice_level: { type: "single", required: false },
  topping: { type: "multiple", required: false },
  extra: { type: "multiple", required: false, max: 5 },
  other: { type: "multiple", required: false, max: 5 },
};

export const DELIVERY_RADIUS_MILES = 5;

export const MANUAL_RESTAURANT_LOCATION = {
  lat: 36.01244975,
  lng: -86.5487051,
};

export const EMPTY_ITEM_SELECTION = {
  dough: null,
  sauce: null,
  extra: [],
  filling: null,
};

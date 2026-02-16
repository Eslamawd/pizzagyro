const DeliveryCartOptions = ({ item }) => {
  if (!item.options || Object.keys(item.options).length === 0) return null;

  return (
    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
      {Object.entries(item.options).map(([groupKey, value]) => {
        if (!value) return null;

        if (Array.isArray(value)) {
          return value.map((option, index) => (
            <p key={`${groupKey}-${index}`}>
              {groupKey.replace("_", " ")}:
              <span className="font-medium ml-1">{option.name}</span>
              {Number(option.price) > 0 && (
                <span className="text-orange-500 ml-1">
                  (+${Number(option.price).toFixed(2)})
                </span>
              )}
              {option.position && option.position !== "whole" && (
                <span className="text-slate-400 ml-1">[{option.position}]</span>
              )}
            </p>
          ));
        }

        return (
          <p key={groupKey}>
            {groupKey.replace("_", " ")}:
            <span className="font-medium ml-1">{value.name}</span>
            {Number(value.price) > 0 && (
              <span className="text-orange-500 ml-1">
                (+${Number(value.price).toFixed(2)})
              </span>
            )}
            {value.position && value.position !== "whole" && (
              <span className="text-slate-400 ml-1">[{value.position}]</span>
            )}
          </p>
        );
      })}
    </div>
  );
};

export default DeliveryCartOptions;

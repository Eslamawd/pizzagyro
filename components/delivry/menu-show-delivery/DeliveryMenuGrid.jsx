import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const DeliveryMenuGrid = ({
  restaurantName,
  menus,
  onSelectMenu,
  getMenuIcon,
}) => {
  return (
    <main className="w-full mx-auto px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-slate-900">
          Menu {restaurantName}
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          Choose from our wide selection and enjoy fast delivery
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {menus.map((menu) => (
          <motion.div
            key={menu.id}
            whileHover={{ y: -10 }}
            onClick={() => onSelectMenu(menu)}
            className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-2xl"
          >
            <img
              src={menu.image}
              alt={menu.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            <div className="absolute bottom-6 right-6 left-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                {getMenuIcon(menu.name)}
                <h3 className="text-2xl font-black truncate">{menu.name}</h3>
              </div>
              <p className="text-orange-300 font-bold flex items-center gap-2 text-sm">
                Show Category <ArrowRight size={16} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
};

export default DeliveryMenuGrid;

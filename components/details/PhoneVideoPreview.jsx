import React from "react";
import { FaBatteryThreeQuarters } from "react-icons/fa6";
import { FiShare2 } from "react-icons/fi";

const PhoneVideoPreview = ({ videoUrl, brandName, headline }) => {
  return (
    <div className="flex justify-center items-center p-4">
      {/* تم تغيير الحدود لتبدو أكثر عصرية */}
      <div className="relative w-[320px] h-[600px] border-[14px] border-gray-900 rounded-[45px] bg-black overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-gray-500/50">
        {/* notch (dynamic island style) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-2xl z-20 shadow-md"></div>

        {/* status bar */}
        <div className="absolute top-4 w-full flex justify-between px-6 text-white text-xs font-medium z-20">
          <div>9:41</div>
          <div className="flex items-center gap-2">
            {/* إضافة أيقونة المشاركة فقط كـ دلالة بصرية */}
            <FiShare2 className="w-3.5 h-3.5" />
            <span>
              <FaBatteryThreeQuarters className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* screen */}
        <div className="w-full h-full bg-black rounded-[31px] overflow-hidden relative">
          <video
            src={videoUrl}
            autoPlay
            controls
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* تراكب داكن في الأسفل لجعل النص واضحًا */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent z-10"></div>

          {/* brand + share: تم تعديل الموضع والألوان للوضوح */}
          <div className="absolute top-8 left-0 right-0 flex justify-between items-center px-4 text-white z-20">
            <span className="text-sm font-extrabold bg-gray-900/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-700/50">
              {brandName ? brandName : "فيديو إرشادي"}
            </span>
          </div>

          {/* headline: تم نقلها للأسفل لتظهر كـ عنوان للفيديو */}
          <div className="absolute bottom-6 left-0 right-0 px-4 text-white z-20">
            <p className="text-xl font-bold leading-snug">
              {headline ? headline : "شرح تفصيلي للعملية"}
            </p>
          </div>

          {/* CTA: مكان محتمل لزر Call to Action */}
        </div>
      </div>
    </div>
  );
};

export default PhoneVideoPreview;

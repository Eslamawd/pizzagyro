import React, { useState } from "react";
// تم استيراد أيقونات جديدة للمطبخ والكاشير
import {
  FaStore,
  FaListAlt,
  FaClipboardList,
  FaQrcode,
  FaChartBar,
  FaUtensils, // أيقونة المطبخ الجديدة
  FaCashRegister, // أيقونة الكاشير الجديدة
} from "react-icons/fa";
import PhoneVideoPreview from "./PhoneVideoPreview";

function DetailsPage() {
  const [activeVideoId, setActiveVideoId] = useState(1);

  const videos = [
    {
      name: "إنشاء مطعم جديد",
      headline: "خطوات إضافة المطعم وإعدادات البداية.",
      url: "/videos/createNewRes.mp4",
      id: 1,
      icon: <FaStore className="w-6 h-6" />,
    },
    {
      name: "إدارة القائمة والفئات والمنيو",
      headline: "مراجعة جميع مميزات إدارة المنيو والأصناف والإضافات.",
      url: "/videos/reveiw all.mp4",
      id: 2,
      icon: <FaListAlt className="w-6 h-6" />,
    },
    {
      name: "عرض صفحة Dashboard",
      headline: "عرض كل المطاعم المسجلة وإيراداتها في لوحة الإدارة.",
      url: "/videos/ShowDashboard.mp4",
      id: 3,
      icon: <FaChartBar className="w-6 h-6" />,
    },
    {
      name: "متابعة الطلبات الخاصة بالمطعم",
      headline: "مراجعة سعر الطلبات، تفاصيلها، الأرباح، والتاريخ.",
      url: "/videos/ordersShow.mp4",
      id: 4,
      icon: <FaClipboardList className="w-6 h-6" />,
    },
    {
      name: "كيفية إنشاء طاولة و QR",
      headline: "إنشاء طاولة والحصول علي QR خاص بها لطباعته بصيغة PDF.",
      url: "/videos/createTable.mp4",
      id: 5,
      icon: <FaQrcode className="w-6 h-6" />, // الأنسب
    },
    {
      name: "الحصول علي QR المطبخ والكاشير",
      headline:
        "الحصول علي QR لكلا من المطبخ والكاشير لتحضير وتجهيز الطلب والفاتوره ومتابعة كل مايحدث.",
      url: "/videos/pdfCashierKetshen.mp4",
      id: 6,
      icon: <FaListAlt className="w-6 h-6" />, // بديل مناسب للـ QR المخصص
    },
    {
      name: "لوحة تحكم المطبخ",
      headline:
        "صفحة مطبخ المطعم: يمكنك نسخ الرابط وارساله الي شاشة المطبخ لمتابعة الطلبات.",
      url: "/videos/kitchendashboard.mp4",
      id: 7,
      icon: <FaUtensils className="w-6 h-6" />, // الأيقونة الجديدة
    },
    {
      name: "لوحة تحكم الكاشير",
      headline:
        "صفحة كاشير المطعم: يمكنك نسخ الرابط وارساله الي شاشة الكاشير لإنهاء الفواتير.",
      url: "/videos/kashierdash.mp4",
      id: 8,
      icon: <FaCashRegister className="w-6 h-6" />, // الأيقونة الجديدة
    },
  ];

  const activeVideo = videos.find((v) => v.id === activeVideoId);

  return (
    <div className="min-h-screen bg-gray-900 py-12 text-white">
      <div className="p-8 max-w-7xl mx-auto shadow-2xl rounded-lg bg-gray-800">
        {/* العنوان الرئيسي */}
        <h1 className="text-5xl font-extrabold text-center mb-4 text-white">
          دليل إدارة النظام بالفيديو
        </h1>

        {/* وصف الصفحة */}
        <p className="text-center text-xl text-gray-400 mb-16 max-w-3xl mx-auto">
          اضغط على القسم الذي تريد تعلمه لعرض الفيديو الإرشادي.
        </p>

        {/* --- قسم الدليل المكون من جزئين --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 1. قائمة الخطوات الإرشادية */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-3xl font-bold mb-6 text-white border-b pb-3 border-gray-700">
              الخطوات الإرشادية ({videos.length} خطوات)
            </h3>

            {videos.map((video) => {
              const isActive = video.id === activeVideoId;

              return (
                <button
                  key={video.id}
                  onClick={() => setActiveVideoId(video.id)}
                  className={`
                    w-full text-right p-4 rounded-xl transition-all duration-200 
                    flex items-center space-x-3 space-x-reverse text-white
                    ${
                      isActive
                        ? "bg-blue-600 shadow-xl shadow-blue-600/50 font-bold transform scale-[1.02]"
                        : "bg-gray-700/70 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                >
                  {/* استنساخ الأيقونة وتمرير لونها حسب حالة النشاط */}
                  {React.cloneElement(video.icon, {
                    className: `w-6 h-6 ${
                      isActive ? "text-white" : "text-blue-400"
                    }`,
                  })}
                  <div className="text-right">
                    <div className="text-lg">{video.name}</div>
                    <div className="text-sm opacity-80">{video.headline}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2. منطقة عرض الفيديو النشط */}
          <div className="lg:col-span-2 flex flex-col items-center p-6 bg-gray-700 rounded-xl shadow-2xl border border-gray-600">
            <h3 className="text-2xl font-bold mb-4 text-white">
              {activeVideo
                ? `شرح: ${activeVideo.name}`
                : "الرجاء اختيار خطوة للبدء في المشاهدة."}
            </h3>

            {activeVideo ? (
              <PhoneVideoPreview
                videoUrl={activeVideo.url}
                brandName={activeVideo.name}
                headline={activeVideo.headline}
              />
            ) : (
              <p className="text-gray-400 p-10">لا يوجد فيديو محدد للعرض.</p>
            )}
          </div>
        </div>

        {/* قسم الملاحظات */}
      </div>
    </div>
  );
}

export default DetailsPage;

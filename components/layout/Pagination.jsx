import { useLanguage } from "@/context/LanguageContext";
import { Button } from "../ui/button";

export default function Pagination({
  currentPage,
  lastPage,
  total,
  onPrev,
  onNext,
  label,
}) {
  const { lang } = useLanguage();
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button onClick={onPrev} disabled={currentPage === 1}>
        {lang === "ar" ? "السابق" : "Prev"}
      </Button>

      <span className="text-sm text-muted-foreground">
        {lang === "ar" ? "صفحة" : "Page"} {currentPage}{" "}
        {lang === "ar" ? "من " : "of"} {lastPage} —{" "}
        {lang === "ar" ? "المجموع" : "Total"}: {total} {label}
      </span>

      <Button onClick={onNext} disabled={currentPage === lastPage}>
        {lang === "ar" ? "التالي" : "Next"}
      </Button>
    </div>
  );
}

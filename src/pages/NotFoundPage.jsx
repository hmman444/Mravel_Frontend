import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-neutral dark:bg-gray-950">
      <Navbar fixedWhite />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("notFound.title")}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
          {t("notFound.desc")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:opacity-90"
        >
          {t("notFound.back_home")}
        </Link>
      </main>
      <Footer />
    </div>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import UserPage from "./UserPage";
import reportWebVitals from "./reportWebVitals";
import "App.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminPage from "AdminPage";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from 'LanguageResources/en.json';
import viTranslation from 'LanguageResources/vi.json';


const router = createBrowserRouter([
  {
    path: "/",
    element: <UserPage />,
  },
  {
    path: "/stardust-admin",
    element: <AdminPage />,
  },
]);
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      vi: {
        translation: viTranslation,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
import "@ant-design/v5-patch-for-react-19";
import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "@/assets/styles/globals.css";
import HomePage from "@/page/home-page";
import Providers from "@/core/providers";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root container with id 'root' was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Providers>
      <HomePage />
    </Providers>
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { queryClient } from "./lib/queryClient";

window.addEventListener("unhandledrejection", event => {
  const reason = event.reason;
  const message =
    reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";

  const isKnownExtensionMessage =
    message.includes("A listener indicated an asynchronous response by returning true") &&
    message.includes("message channel closed before a response was received");

  if (isKnownExtensionMessage) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

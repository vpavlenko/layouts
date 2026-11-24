import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlAtlalKeyboard } from "./components/AlAtlalKeyboard";
import "./styles/keyboard.css";
import { TASK_CONFIGS } from "./tasks/tasks";

const PianoController = lazy(async () => ({
  default: (await import("./components/PianoController")).PianoController,
}));

export default function App() {
  const defaultSlug = TASK_CONFIGS[0]?.slug || "white-keys";

  // Handle redirect from 404.html
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("p");
    if (path) {
      // Remove the parameter and replace the URL with the actual path
      window.history.replaceState(
        null,
        "",
        window.location.pathname.replace("/?", "/") + path
      );
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/layouts/al-atlal" element={<AlAtlalKeyboard />} />
        <Route path="/layouts/:slug" element={<Suspense fallback={null}><PianoController /></Suspense>} />
        <Route
          path="/layouts"
          element={<Navigate to={`/layouts/${defaultSlug}`} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={`/layouts/${defaultSlug}`} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

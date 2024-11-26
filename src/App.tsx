import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PianoController } from "./components/PianoController";
import "./styles/keyboard.css";
import { TASK_CONFIGS } from "./tasks/tasks";

export default function App() {
  const defaultSlug = TASK_CONFIGS[0]?.slug || "white-keys";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/layouts/:slug" element={<PianoController />} />
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

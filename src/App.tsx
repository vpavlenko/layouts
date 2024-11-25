import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PianoController } from "./components/PianoController";
import { URL_PREFIX } from "./constants/routes";
import "./styles/keyboard.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`${URL_PREFIX}/:taskId`} element={<PianoController />} />
        <Route
          path={URL_PREFIX}
          element={<Navigate to={`${URL_PREFIX}/0`} replace />}
        />
        <Route path="*" element={<Navigate to={`${URL_PREFIX}/0`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

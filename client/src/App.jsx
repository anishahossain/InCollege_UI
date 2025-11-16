// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainMenu from "./pages/MainMenu";
import ProfileEditPage from "./pages/ProfileEditPage";
import ViewProfilePage from "./pages/ViewProfilePage";  // ⬅️ NEW

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/profile" element={<ProfileEditPage />} />
        <Route path="/profile/view" element={<ViewProfilePage />} /> {/* ⬅️ NEW */}
      </Routes>
    </BrowserRouter>
  );
}

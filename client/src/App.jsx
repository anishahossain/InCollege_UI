// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainMenu from "./pages/MainMenu";
import ProfileEditPage from "./pages/ProfileEditPage";
import ViewProfilePage from "./pages/ViewProfilePage";  // ⬅️ NEW
import FindSomeonePage from "./pages/FindSomeonePage";
import PendingRequestsPage from "./pages/PendingRequestPage";
import ViewNetworkPage from "./pages/ViewNetworkPage";
import JobsSearchPage from "./pages/JobSearchPage";
import JobsMenuPage from "./pages/JobsMenuPage";
import PostJobPage from "./pages/PostJobPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import MessagesMenuPage from "./pages/MessagesMenuPage";
import SendMessagePage from "./pages/SendMessagePage";
import MyMessagesPage from "./pages/MyMessagesPage";
import SentMessagesPage from "./pages/SentMessagesPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/profile" element={<ProfileEditPage />} />
        <Route path="/profile/view" element={<ViewProfilePage />} /> {/* ⬅️ NEW */}
        <Route path="/find-someone" element={<FindSomeonePage />} />
        <Route path="/connections/pending" element={<PendingRequestsPage />} />
        <Route path="/connections/network" element={<ViewNetworkPage />} />
        <Route path="/jobs/search" element={<JobsSearchPage />} />
        <Route path="/jobs" element={<JobsMenuPage />} />
        <Route path="/jobs/post" element={<PostJobPage />} />
        <Route path="/jobs/applications" element={<MyApplicationsPage />} />
        <Route path="/messages" element={<MessagesMenuPage />} />
        <Route path="/messages/send" element={<SendMessagePage />} />
        <Route path="/messages/inbox" element={<MyMessagesPage />} />
        <Route path="/messages/sent" element={<SentMessagesPage />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;
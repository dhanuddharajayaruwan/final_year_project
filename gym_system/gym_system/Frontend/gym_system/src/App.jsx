import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import GuestOrderTrackPage from "./pages/GuestOrderTrackPage";
import PlanDetailsPage from "./pages/PlanDetailsPage";
import TeamPage from "./pages/TeamPage";
import TermsPage from "./pages/TermsPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import FaqsPage from "./pages/FaqsPage";
import AdminDashboard from "./pages/dashboards/admin/AdminDashboard";
import Overview from "./pages/dashboards/admin/tabs/Overview";
import UserManagement from "./pages/dashboards/admin/tabs/UserManagement";
import TrainerManagement from "./pages/dashboards/admin/tabs/TrainerManagement";
import ShopManagement from "./pages/dashboards/admin/tabs/ShopManagement";
import SubscriptionPlans from "./pages/dashboards/admin/tabs/SubscriptionPlans";
import OrderManagement from "./pages/dashboards/admin/tabs/OrderManagement";
import ReviewManagement from "./pages/dashboards/admin/tabs/ReviewManagement";
import ChatManagement from "./pages/dashboards/admin/tabs/ChatManagement";
import ContactMessages from "./pages/dashboards/admin/tabs/ContactMessages";
import ClientDashboard from "./pages/dashboards/client/ClientDashboard";
import ClientOverview from "./pages/dashboards/client/tabs/Overview";
import MemberOrders from "./pages/dashboards/client/tabs/Orders";
import Subscriptions from "./pages/dashboards/client/tabs/Subscriptions";
import MemberTrainers from "./pages/dashboards/client/tabs/Trainers";
import Schedules from "./pages/dashboards/client/tabs/Schedules";
import Reviews from "./pages/dashboards/client/tabs/Reviews";
import MemberChat from "./pages/dashboards/client/tabs/Chat";
import TrainerDashboard from "./pages/dashboards/trainer/TrainerDashboard";
import TrainerOverview from "./pages/dashboards/trainer/tabs/Overview";
import TrainerClients from "./pages/dashboards/trainer/tabs/Clients";
import TrainerSchedules from "./pages/dashboards/trainer/tabs/Schedules";
import TrainerClips from "./pages/dashboards/trainer/tabs/Clips";
import TrainerChat from "./pages/dashboards/trainer/tabs/Chat";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ChatbotWidget from "./components/ChatbotWidget";
import { useLocation } from "react-router-dom";

function ChatbotWidgetConditional() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <ChatbotWidget />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/track-order" element={<GuestOrderTrackPage />} />
            <Route
              path="/subscription-details/:id"
              element={<PlanDetailsPage />}
            />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route
                index
                element={<Navigate to="/admin/overview" replace />}
              />
              <Route path="overview" element={<Overview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="trainers" element={<TrainerManagement />} />
              <Route path="shop" element={<ShopManagement />} />
              <Route path="subscriptions" element={<SubscriptionPlans />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="chat" element={<ChatManagement />} />
              <Route path="contact" element={<ContactMessages />} />
            </Route>
            <Route path="/member" element={<ClientDashboard />}>
              <Route
                index
                element={<Navigate to="/member/overview" replace />}
              />
              <Route path="overview" element={<ClientOverview />} />
              <Route path="orders" element={<MemberOrders />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="trainers" element={<MemberTrainers />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="chat" element={<MemberChat />} />
            </Route>
            <Route path="/trainer" element={<TrainerDashboard />}>
              <Route
                index
                element={<Navigate to="/trainer/overview" replace />}
              />
              <Route path="overview" element={<TrainerOverview />} />
              <Route path="clients" element={<TrainerClients />} />
              <Route path="schedules" element={<TrainerSchedules />} />
              <Route path="clips" element={<TrainerClips />} />
              <Route path="chat" element={<TrainerChat />} />
            </Route>
            {/* Legacy redirect */}
            <Route
              path="/dashboard"
              element={<Navigate to="/admin/overview" replace />}
            />
          </Routes>
          <ChatbotWidgetConditional />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

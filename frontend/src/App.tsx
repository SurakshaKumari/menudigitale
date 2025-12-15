// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { useEffect } from 'react'
import { initializeAuth } from './store/authStore'

// Import Create Menu Page
import CreateMenuPage from './pages/menus/CreateMenuPage' // You need to create this

// Menu Management Pages
import MenuManagement from './pages/MenuManagement'
// import CategoriesPage from './pages/menu/CategoriesPage'
// import DishesPage from './pages/menu/DishesPage'
// import StyleEditorPage from './pages/menu/StyleEditorPage'
// import PDFGeneratorPage from './pages/menu/PDFGeneratorPage'
// import StatisticsPage from './pages/menu/StatisticsPage'
// import LiveMenuPage from './pages/menu/LiveMenuPage'
// import OpeningHoursPage from './pages/menu/OpeningHoursPage'
// import WhatsAppPage from './pages/menu/WhatsAppPage'

// Allergen Management
// import AllergenManagement from './pages/AllergenManagement'

// // User Management
// import UserManagement from './pages/UserManagement'

// // Restaurant Management
// import RestaurantManagement from './pages/RestaurantManagement'

// // Public Menu
// import PublicMenu from './pages/PublicMenu'

function App() {
  // Initialize auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="menu-digitale-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/menu/:slug" element={<PublicMenu />} />
          <Route path="/menu/:slug/:language" element={<PublicMenu />} /> */}
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              {/* Dashboard */}
              <Route index element={<Dashboard />} />
              
              {/* Create New Menu - ADD THIS ROUTE */}
              <Route path="menu/create" element={<CreateMenuPage />} />
              
              {/* Menu Management Routes */}
              <Route path="menus/:id" element={<MenuManagement />}>
                {/* <Route index element={<CategoriesPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="dishes" element={<DishesPage />} />
                <Route path="style" element={<StyleEditorPage />} />
                <Route path="pdf" element={<PDFGeneratorPage />} />
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="live" element={<LiveMenuPage />} />
                <Route path="hours" element={<OpeningHoursPage />} />
                <Route path="whatsapp" element={<WhatsAppPage />} /> */}
              </Route>
              
              {/* Allergen Management */}
              {/* <Route path="allergens" element={<AllergenManagement />} /> */}
              
              {/* User Management */}
              {/* <Route path="users" element={<UserManagement />} /> */}
              
              {/* Restaurant Management */}
              {/* <Route path="restaurants" element={<RestaurantManagement />} /> */}
              
              {/* Settings */}
              <Route path="settings" element={<div>Settings Page</div>} />
              
              {/* Profile */}
              <Route path="profile" element={<div>Profile Page</div>} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
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

// Menu Related Pages
import CreateMenuPage from './pages/menus/CreateMenu'
import MenuListPage from "./pages/menus/ListingMenu"
import MenuDetailPage from './pages/menus/MenuDetailPage' 

// Allergen Management
import AllergenListPage from './pages/allergens/AllergenListPage' // New: Allergen List
import AllergenFormPage from './pages/allergens/AllergenFormPage' // New: Create/Edit Allergen

// User Management
// import UserManagement from './pages/UserManagement'

// Restaurant Management
// import RestaurantManagement from './pages/RestaurantManagement'

// Public Menu
// import PublicMenu from './pages/PublicMenu'

// Settings & Profile
// import SettingsPage from './pages/SettingsPage'
// import ProfilePage from './pages/ProfilePage'

function App() {
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
              
              {/* Menu Management Routes */}
              <Route path="menus">
                {/* Menu List - Shows all menus */}
                <Route index element={<MenuListPage />} />
                
                {/* Create New Menu */}
                <Route path="create" element={<CreateMenuPage />} />
                
                {/* Menu Detail with nested routes */}
                <Route path=":menuId" element={<MenuDetailPage />}>
                  {/* This will be handled in MenuDetailPage with tabs */}
                </Route>
              </Route>
              
              {/* Allergen Management Routes */}
              <Route path="allergens">
                {/* Allergen List */}
                <Route index element={<AllergenListPage />} />
                
                {/* Create New Allergen */}
                <Route path="create" element={<AllergenFormPage />} />
                
                {/* Edit Allergen */}
                <Route path=":allergenId/edit" element={<AllergenFormPage />} />
              </Route>
              
              {/* User Management */}
              {/* <Route path="users" element={<UserManagement />} /> */}
              
              {/* Restaurant Management */}
              {/* <Route path="restaurants" element={<RestaurantManagement />} /> */}
              
              {/* Settings */}
              {/* <Route path="settings" element={<SettingsPage />} /> */}
              
              {/* Profile */}
              {/* <Route path="profile" element={<ProfilePage />} /> */}
            </Route>
          </Route>
          
          {/* Catch all route - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
// Copyright © 2024 Navarrotech

// React.js & Router
import ReactDOM from 'react-dom/client';
import { Navigate, Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom";

// Firebase
import './firebase'

// Redux
import { Provider } from 'react-redux'
import Initialization from './modules/authentication/Initialization'
import store from './store/store'

// Modules
import { AuthorizedOutlet } from './modules/authentication/Outlet';
import * as Auth from './modules/authentication/Forms'

// Pages
import MealPlanLayout from './modules/meals/Layout'
import RecipeLayout from './modules/recipes/Layout';
import TodayLayout from './modules/today/Layout';
import SettingsLayout from './modules/settings/Layout';
import ManagePeople from './modules/settings/components/ManagePeople';
import ManageData from './modules/settings/components/ManageData';

// Stylesheet
import "./sass/index.sass"

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <Provider store={store}>
        <Initialization>
            <BrowserRouter>
                <Routes>
                    <Route index path="/login" element={<Auth.Layout mode="login" />} />
                    <Route path="/signup" element={<Auth.Layout mode="signup" />} />
                    <Route path="/logout" element={<Auth.Logout />} />
                    <Route path="/dashboard" element={<AuthorizedOutlet />}>
                        <Route path="/dashboard" index element={<Navigate to="/dashboard/meals" />} />
                        <Route path="/dashboard/meals" element={<MealPlanLayout />} />
                        <Route path="/dashboard/recipes" element={<RecipeLayout />} />
                        <Route path="/dashboard/today" element={<TodayLayout />} />
                        <Route path="/dashboard/tomorrow" element={<TodayLayout dayOffset={1} />} />
                        <Route path="/dashboard/settings" element={<SettingsLayout />}>
                            <Route index element={<Navigate to="/dashboard/settings/people" />} />
                            <Route path="people" element={<ManagePeople />} />
                            <Route path="data" element={<ManageData />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </Initialization>
    </Provider>
);

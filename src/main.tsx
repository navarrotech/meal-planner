// Copyright © 2023 Navarrotech

// React.js & Router
import ReactDOM from 'react-dom/client';
import { Navigate, Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom";

// Firebase
import './firebase'

// Redux
import { Provider } from 'react-redux'
import Initialization from './modules/core/Initialization'
import store from './store/store'

// Modules
import { AuthorizedOutlet } from './modules/authentication/Outlet';
import * as Auth from './modules/authentication/Forms'
import VideoManager from './modules/videos/Layout'

// Stylesheet
import "./sass/index.sass"

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Provider store={store}>
        <Initialization>
            <BrowserRouter>
                <Routes>
                    <Route index path="/login" element={<Auth.Layout mode="login" />} />
                    <Route path="/signup" element={<Auth.Layout mode="signup" />} />
                    <Route path="/logout" element={<Auth.Logout />} />
                    <Route path="/dashboard" element={<AuthorizedOutlet />}>
                        <Route path="/dashboard" index element={<Navigate to="/dashboard/videos" />} />
                        <Route path="/dashboard/videos" element={<VideoManager />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </Initialization>
    </Provider>
);

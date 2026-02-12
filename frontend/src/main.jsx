import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { AppContextProvider } from "./context/AppContext";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { Provider } from "react-redux";
import { store } from "./store/store";
import ThemeSync from './components/common/ThemeSync';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeSync />
      <AppContextProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppContextProvider>
    </Provider>
  </BrowserRouter>
);

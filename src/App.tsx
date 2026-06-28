/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainArea from "./components/MainArea";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1F1F1F',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainArea />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import CodeAnalyzer from "./components/CodeAnalyzer";

const App: React.FC = () => (
  <Provider store={store}>
    <CodeAnalyzer />
  </Provider>
);

export default App;

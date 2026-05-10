import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

    const addToast = (message, type = "info", duration = 3000) => {
        const id = Date.now();

            const newToast = { id, message, type };
                setToasts((prev) => [...prev, newToast]);

                    setTimeout(() => {
                          removeToast(id);
                              }, duration);
                                };

                                  const removeToast = (id) => {
                                      setToasts((prev) => prev.filter((t) => t.id !== id));
                                        };

                                          return (
                                              <ToastContext.Provider value={{ addToast, toasts, removeToast }}>
                                                    {children}
                                                        </ToastContext.Provider>
                                                          );
                                                          }

                                                          export const useToast = () => useContext(ToastContext);
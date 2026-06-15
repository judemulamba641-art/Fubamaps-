/**
 * Container de notifications toast (position fixe en haut a droite).
 */
export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            ...styles.toast,
            background:
              toast.type === "success"
                ? "#16a34a"
                : toast.type === "error"
                  ? "#dc2626"
                  : "#334155",
          }}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 16,
    right: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 10000,
    pointerEvents: "none",
  },
  toast: {
    padding: "10px 16px",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    fontWeight: 500,
    minWidth: 200,
    maxWidth: 320,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    cursor: "pointer",
    pointerEvents: "auto",
  },
};

import styles from "./AlertBanner.module.css";
export default function AlertBanner({ type="warning", title, children, onClose }) { return <div className={`${styles.banner} ${type === "danger" ? styles.danger : styles.warning}`}><div><strong>{title}</strong><div>{children}</div></div>{onClose && <button className={styles.close} onClick={onClose}>×</button>}</div>; }

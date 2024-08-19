import styles from "./page.module.css";
import ZipCodeForm from "./components/ZipCodeForm";

export default function Home() {
  return (
    <main className={styles.main}>
      <ZipCodeForm/>
    </main>
  );
}

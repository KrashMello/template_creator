fn main() {
  // El sidecar se busca por triple en `src-tauri/binaries` durante el desarrollo.
  println!(
    "cargo:rustc-env=TARGET_TRIPLE={}",
    std::env::var("TARGET").expect("TARGET")
  );
  tauri_build::build()
}

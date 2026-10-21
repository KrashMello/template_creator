import { computed, onMounted, onUnmounted, watch } from "vue";

export type Theme = "system" | "light" | "dark";

/**
 * Shared theme state. `app.vue` renders the `dark`/`light` class on <html>
 * from `theme`; "system" leaves the html unclassed so the CSS media query
 * decides. The cookie keeps SSR in sync with the last choice (no flash).
 */
export const useTheme = () => {
  const cookie = useCookie<Theme>("tc_theme", {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  const theme = useState<Theme>("tc-theme", () => cookie.value ?? "system");
  watch(theme, (value) => {
    cookie.value = value;
  });

  // Only used while the choice is "system": mirror the OS preference.
  const systemDark = useState<boolean>("tc-system-dark", () => false);
  const onSystemChange = (event: MediaQueryListEvent) => {
    systemDark.value = event.matches;
  };
  let mediaQuery: MediaQueryList | null = null;
  onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemDark.value = mediaQuery.matches;
    mediaQuery.addEventListener("change", onSystemChange);
  });
  onUnmounted(() => mediaQuery?.removeEventListener("change", onSystemChange));

  /**
   * Class to render on <html>. While the choice is "system" and the OS is
   * still unknown (SSR) it stays null: the CSS media query owns the colors
   * and no class is emitted, so class-based `dark:` swaps (logo, screenshots)
   * only kick in once the client resolves the real preference.
   */
  const resolved = useState<"dark" | "light" | null>("tc-resolved-theme", () =>
    theme.value === "system" ? null : theme.value
  );
  watch([theme, systemDark], () => {
    resolved.value =
      theme.value === "system" ? (systemDark.value ? "dark" : "light") : theme.value;
  });

  const isDark = computed(
    () => theme.value === "dark" || (theme.value === "system" && systemDark.value)
  );
  const toggle = () => {
    theme.value = isDark.value ? "light" : "dark";
  };

  return { theme, resolved, isDark, toggle };
};

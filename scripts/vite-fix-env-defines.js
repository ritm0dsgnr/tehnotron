/**
 * Vite's clientInjectionsPlugin matches env.mjs by exact path.
 * On Windows the drive letter case can differ (S: vs s:), so __DEFINES__
 * stays unsubstituted and every page JS module fails to boot.
 */
export function fixViteEnvDefines() {
  const isEnvMjs = (id) =>
    id.replace(/\\/g, "/").toLowerCase().includes("/vite/dist/client/env.mjs");

  return {
    name: "fix-vite-env-defines",
    enforce: "post",
    transform(code, id) {
      if (!isEnvMjs(id) || !code.includes("__DEFINES__")) return null;
      return code.replace("__DEFINES__", "{}");
    },
  };
}

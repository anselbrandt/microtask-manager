import pluginVue from "eslint-plugin-vue";
import globals from "globals";

function cleanGlobals(globalsObj) {
  const cleaned = {};
  for (const key in globalsObj) {
    cleaned[key.trim()] = globalsObj[key];
  }
  return cleaned;
}

export default [
  ...pluginVue.configs["flat/recommended"],
  {
    rules: {
      // Your overrides
    },
    languageOptions: {
      sourceType: "module",
      globals: cleanGlobals(globals.browser),
    },
  },
];

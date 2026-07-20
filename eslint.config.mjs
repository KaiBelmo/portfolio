import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "Cï€ºUsersAdmin.geminiantigravitybrain1e216fee-40d5-45c0-8308-2ebcf4291accscratchts-ascii-engine",
      "**/dist/**",
      "**/dist-esm/**",
      "**/out/**",
      "**/output/**",
      "**/scratch/**",
    ],
  },
  ...nextVitals,
];

export default eslintConfig;

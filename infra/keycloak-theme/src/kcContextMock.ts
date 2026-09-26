import { createGetKcContextMock } from "keycloakify/login/KcContext/getKcContextMock";
import type { KcContextExtension, KcContextExtensionPerPage } from "./login/KcContext";

const { getKcContextMock } = createGetKcContextMock({
  kcContextExtension: { themeName: "project", properties: {} } satisfies KcContextExtension,
  kcContextExtensionPerPage: {} satisfies KcContextExtensionPerPage,
  overrides: {
    realm: { displayName: "Project" },
  },
});

export const kcContextMock = getKcContextMock({ pageId: "login.ftl" });

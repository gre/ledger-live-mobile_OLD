// @flow
import { AppRegistry } from "react-native";
import { Sentry } from "react-native-sentry";
import Config from "react-native-config";

import App from "./src";
import { getEnabled } from "./src/components/HookSentry";

if (Config.SENTRY_DSN && !__DEV__) {
  Sentry.config(Config.SENTRY_DSN, {
    handlePromiseRejection: true,
    autoBreadcrumbs: {
      xhr: false,
    },
  }).install();

  Sentry.setUserContext({
    ip_address: null,
  });

  const blacklistErrorName = ["NetworkDown"];
  const blacklistErrorDescription = [/Device .* was disconnected/];

  Sentry.setShouldSendCallback((event: mixed) => {
    if (!getEnabled()) return false;

    // If the error matches blacklistErrorName or blacklistErrorDescription,
    // we will not send it to Sentry.
    if (event && typeof event === "object") {
      const { exception } = event;
      if (
        exception &&
        typeof exception === "object" &&
        Array.isArray(exception.values)
      ) {
        const { values } = exception;
        const shouldBlacklist = values.some(item => {
          if (item && typeof item === "object") {
            const { type, value } = item;
            return (
              (typeof type === "string" &&
                blacklistErrorName.some(pattern => type.match(pattern))) ||
              (typeof value === "string" &&
                blacklistErrorDescription.some(pattern => value.match(pattern)))
            );
          }
          return false;
        });
        if (shouldBlacklist) return false;
      }
    }

    return true;
  });
}

if (Config.DISABLE_YELLOW_BOX) {
  // $FlowFixMe
  console.disableYellowBox = true; // eslint-disable-line no-console
}

AppRegistry.registerComponent("ledgerlivemobile", () => App);

import merge from "lodash.merge";

const stage = process.env.NODE_ENV || "development";

let config;

if (stage === "development") {
  config = require("./development").default;
} else if (stage === "production") {
  config = require("./production").default;
} else {
  throw new Error(`Invalid NODE_ENV: ${stage}`);
}

export default merge(
  {
    stage,
  },
  config,
);

import merge from "lodash.merge";

const stage = process.env.NODE_ENV || "development";

let configuration;

if (stage === "development") {
  configuration = require("./development").default;
} else if (stage === "production") {
  configuration = require("./production").default;
} else {
  throw new Error(`Invalid NODE_ENV: ${stage}`);
}

export default merge(
  {
    stage,
  },
  configuration,
);

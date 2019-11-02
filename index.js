require("isomorphic-fetch");
require("now-env");

const createClient = require("hafas-client");
const vbbProfile = require("hafas-client/p/vbb");
const client = createClient(vbbProfile, "vbbMicro");

const { parse } = require("url");
const { send } = require("micro");

module.exports = async (req, res) => {
  const { query } = parse(req.url);
  const {
    from,
    to,
    type = "d",
    departure = new Date(),
    arrival = null,
    results = 5,
    via = null,
    stopovers = false,
    transfers = -1,
    transferTime = 0,
    sbahn = true,
    ubahn = true,
    tram = true,
    bus = true,
    ferry = true,
    express = true,
    rbahn = true,
    remarks = true,
    startWithWalking = true,
    language = "de",
  } = parseQueryString(query);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  if (query) {
    const products = {
      suburban: sbahn,
      subway: ubahn,
      tram,
      bus,
      ferry,
      express,
      regional: rbahn,
    };
    let opt;
    if (type === "d") {
      opt = {
        departure,
        results,
        via,
        stopovers,
        transfers,
        transferTime,
        products,
        remarks,
        startWithWalking,
        language,
      };
    } else {
      opt = {
        arrival,
        results,
        via,
        stopovers,
        transfers,
        transferTime,
        products,
        remarks,
        startWithWalking,
        language,
      };
    }
    client
      .journeys(from, to, opt)
      .then(data => send(res, 200, data))
      .catch(error => send(res, 500, error));
  } else {
    send(res, 200, '{"result": "No journey provided"}');
  }
};

const parseQueryString = function(queryString) {
  const params = {};
  const queries = queryString.split("&");
  for (let i = 0; i < queries.length; i++) {
    const temp = queries[i].split("=");
    params[temp[0]] = temp[1];
  }
  return params;
};

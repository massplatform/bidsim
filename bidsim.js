/*
 *          __  ______   __________
 *         /  |/  /   | / ___/ ___/
 *        / /|_/ / /| | \__ \\__ \
 *       / /  / / ___ |___/ /__/ /
 *      /_/ _/_/_/__|_/____/____/ ______  ___
 *         / __ )/  _/ __ \/ ___//  _/  |/  /
 *        / __  |/ // / / /\__ \ / // /|_/ /
 *       / /_/ // // /_/ /___/ // // /  / /
 *      /_____/___/_____//____/___/_/  /_/
 *
 *            reda.borchardt@massplatform.net
 */

var argv = require("yargs/yargs")(process.argv.slice(2))

  .usage("Usage $0 <input> [options]")
  .example("$0 -w 320 -h 200 -d mydeal -t mytag.js -p 1000 --replaceadm")

  .boolean("replaceprice")
  .alias("replaceprice", "p")
  .describe("replaceprice", "Sets all prices to zero")
  .default('replaceprice', false)

  .boolean("replaceadm")
  .alias("replaceadm", "r")
  .describe("replaceadm", "Replaces all ADM fields")
  .default("replaceadm", false)

  .number("newprice")
  .alias("newprice", "n")
  .describe("newprice", "New price if replaceprice=true")

  .string('filter')
  .alias('filter', 'f')
  .describe("filter", "Apply override only on DealID")
  .default("filter","*")

  .boolean ('inject')
  .alias('inject','j')
  .describe('inject','Inject new bid')
  .default("inject", false)

  .help("h")
  .alias("h", "help")
  .epilog("Massplatform Limited 2021")
  .alias("v", "version")
  .argv

console.log(argv)
console.log(argv.replaceadm)

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

  .usage("Usage $0 [options]")

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
  .describe("filter", "Replace only matching DealID")
  .default("filter","*")

  .boolean('nuke')
  .alias('nuke', 'x')
  .describe("nuke", "Nuke all bids that came back")
  .default("nuke", false)

  .boolean ('inject')
  .alias('inject','i')
  .describe('inject','Inject new bid')
  .default("inject", false)

  .number('width')
  .alias('width', 'w')
  .describe('width', 'Width of ad to inject')
  .default('width', '300')

  .number('height')
  .alias('height', 'h')
  .describe('height', 'Height of ad to inject')
  .default('height', '250')

  .number('bid')
  .alias('bid', 'b')
  .describe('bid', 'Bid price of ad to inject')
  .default('bid', '1000')

  .string('dealid')
  .alias('dealid', 'd')
  .describe('dealid', 'Dealid of ad to inject')
  .default('dealid', null)

  .string('tag')
  .alias('tag', 't')
  .describe('tag', '[filepath] of tag to inject')
  .default('tag', null)

  .string('advertiser')
  .alias('advertiser','a')
  .describe('advertiser', 'Advertiser to inject')
  .default('advertiser', 'My Brand')

  .string('seatid')
  .alias('seatid', 's')
  .describe('seatid', 'SeatID of buyer to inject')
  .default('seatid', '12345')

  .help("help")
  .alias("?", 'help')
  .epilog("Massplatform Limited 2021")
  .alias("v", "version")
  .argv

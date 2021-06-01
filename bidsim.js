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

// TODO: Add support for other Exchanges

/*
 * YARGS SECTION START
 */
var argv = require('yargs/yargs')(process.argv.slice(2))

  .usage('Usage $0 [options]')

  .boolean('replaceprice')
  .alias('replaceprice', 'p')
  .describe('replaceprice', 'Sets all prices to zero')
  .default('replaceprice', false)

  .boolean('replaceadm')
  .alias('replaceadm', 'r')
  .describe('replaceadm', 'Replaces all ADM fields')
  .default('replaceadm', false)

  .number('newprice')
  .alias('newprice', 'n')
  .describe('newprice', 'New price if replaceprice=true')

  .string('filter')
  .alias('filter', 'f')
  .describe('filter', 'Replace only matching DealID')
  .default('filter','*')

  .boolean('nuke')
  .alias('nuke', 'x')
  .describe('nuke', 'Nuke all bids that came back')
  .default('nuke', false)

  .boolean ('inject')
  .alias('inject','i')
  .describe('inject','Inject new bid')
  .default('inject', false)

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

  .help('help')
  .alias('?', 'help')
  .epilog('Massplatform Limited 2021')
  .alias('v', 'version')
  .argv

/*
 * IMPORTS & DECLARATIONS SECTION START
 */

const chromeLauncher = require ('chrome-launcher') // Find and launch Chrome in Developer mode
const CDP = require('chrome-remote-interface')     // on MacOS, Linux, BSD and Windows
const queryString = require('querystring')         // Utility to parse the querystring sent to the Exchange endpoint
const colors = require('colors').terminal          // Some color for a nicer output in the terminalv

/*
 * IMPORTS & DECLARATIONS SECTION END
 */

/*
 * BIG OLD MAIN()
 */

async function main() {

  const chrome = await chromeLauncher.launch ({
    chromeFlags:[
      '--window-size=1200,800',
      '--auto-open-devtools-for-tabs',
    ]
  })

  const protocol = await CDP({ port: chrome.port })
  const {Runtime, Network} = protocol

  await Promise.all([Runtime.enable(), Network.enable()])
  console.log ('>> Connected to Chrome on port:%d', chrome.port)

  await Network.setRequestInterception(
    {
      patterns: [
        {
          urlPattern: '*casale*cygnus*',
          resourceType: 'XHR',
          interceptionStage: 'HeadersReceived'
        }
      ]
    }
  )

  Network.requestIntercepted(
    async ({interceptionId, request}) => {
      console.log("******* CYGNUS REQUEST DETECTED **** INTERCEPTION ID: %s ***".bgGreen.black, interceptionId)
      console.log('NETWORK REFERER: ' + getTopDomain(request.headers.Referer))
      let ixRequest = JSON.parse(isolateQueryString(request.url).r)
      typeof ixRequest && ixRequest.site != 'undefined' ? outputIxSiteInfo(ixRequest.site) : console.log('UH OH!! We do not know what site is?')
      console.log(ixRequest)

      if (typeof ixRequest.imp != 'undefined') {
        let bannercount = 0
        let unknowncount = 0
        console.log(ixRequest.imp.length + ' placement(s) found in request')
        ixRequest.imp.forEach(element =>
          typeof element.banner != 'undefined' ? bannercount += 1 : unknowncount += 1
        )
        console.log('%s banner(s) & %s unknown(s) (unknown means probably video)', bannercount, unknowncount )

        ixRequest.imp.forEach(element =>
          typeof element.banner != 'undefined' ? console.log('IMPID: %s, %s W:%s H:%s', element.id, element.ext, element.banner.w, element.banner.h) :
            console.log('IMPID: %s, %s', element.id, element.ext)
        )
      }
        else {
        console.log('No placements have been found in the request. That is rather strange!')
      }
    }
  )

} /* <-- This bracket means you just left main
 * main() is launched at the very end. First we proceed and hoist
 * all the other stuff we are going to use that hasn't been imported
 * because I am too lazy
 */

function outputIxSiteInfo(site) {
  typeof site.ref != 'undefined' ? console.log('IX REFERER: ' + truncateString(site.ref,70)) : console.log('NO IX REFERER FOUND') // The IX Referer only exists after you navigate
  typeof site.page != 'undefined' ? console.log('IX PAGE: ' + truncateString(site.page, 70)) : console.log('NO IX PAGE FOUND') //
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

truncateString("A-tisket a-tasket A green and yellow basket", 8);

function getTopDomain(url) {
  let hostname
  let protocol = 'https://'
  // remove protocol
  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2]
    protocol = url.split('/')[0]+'//'
  } else {
    hostname = url.split('/')[0]
  }
  // remove port number
  hostname = hostname.split(':')[0]
  // remove ?
  hostname = hostname.split('?')[0]
  if (protocol ==='//') {
    protocol = 'https://'
  }
  return protocol+hostname
}

function isolateQueryString(url) {
  return queryString.parse(url.split('?')[1])
}

main()

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


/*
 * YARGS SECTION START
 *
 * Usage bidsim.js [options]
 *
  -p, --replaceprice  Sets all prices to zero         [boolean] [default: false]
  -r, --replaceadm    Replaces all ADM fields         [boolean] [default: false]
  -n, --newprice      New price if replaceprice=true       [number] [default: 0]
  -f, --filter        Replace only matching DealID       [string] [default: "*"]
  -x, --nuke          Nuke all bids that came back    [boolean] [default: false]
  -e, --everything    bid on everything               [boolean] [default: false]
  -i, --inject        Inject new bid                  [boolean] [default: false]
  -w, --width         Width of ad to inject            [number] [default: "300"]
  -h, --height        Height of ad to inject           [number] [default: "250"]
  -b, --bid           Bid price of ad to inject       [number] [default: "1000"]
  -d, --dealid        Dealid of ad to inject            [string] [default: null]
  -t, --tag           [filepath] of tag to inject       [string] [default: null]
  -a, --advertiser    Advertiser to inject        [string] [default: "My Brand"]
  -m, --meta          OpenRTB Meta                    [boolean] [default: false]
  -s, --seatid        SeatID of buyer to inject      [string] [default: "12345"]
  -?, --help          Show help                                        [boolean]
  -v, --version       Show version number                              [boolean]
 *
 */
const argv = require('yargs/yargs')(process.argv.slice(2))

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
  .default('newprice', 0)

  .string('filter')
  .alias('filter', 'f')
  .describe('filter', 'Replace only matching DealID')
  .default('filter', '*')

  .boolean('nuke')
  .alias('nuke', 'x')
  .describe('nuke', 'Nuke all bids that came back')
  .default('nuke', false)

  .boolean('everything')
  .alias('everything', 'e')
  .describe('everything', 'bid on everything')
  .default('everything', false)

  .boolean('inject')
  .alias('inject', 'i')
  .describe('inject', 'Inject new bid')
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
  .alias('advertiser', 'a')
  .describe('advertiser', 'Advertiser to inject')
  .default('advertiser', 'My Brand')

  .boolean('meta')
  .alias('meta', 'm')
  .describe('meta', 'OpenRTB Meta')
  .default('meta', false)

  .string('seatid')
  .alias('seatid', 's')
  .describe('seatid', 'SeatID of buyer to inject')
  .default('seatid', '12345')

  .string('userdirectory')
  .alias('userdirectory', 'u')
  .describe('userdirectory', 'Optional Chrome user dir')
  .default('userdirectory', '')

  .string('starturl')
  .alias('starturl', 's')
  .describe('starturl', 'Page to open at start')
  .default('starturl', 'about-blank')

  .help('help')
  .alias('?', 'help')
  .epilog('Massplatform Limited 2021')
  .alias('v', 'version')
  .argv

console.log(argv)

/*
 * IMPORTS & DECLARATIONS SECTION START
 */

const chromeLauncher = require('chrome-launcher') // Find and launch Chrome in Developer mode
const CDP = require('chrome-remote-interface') // on MacOS, Linux, BSD and Windows
const queryString = require('querystring') // Utility to parse the querystring sent to the Exchange endpoint
const colors = require('colors') // Some color for a nicer output in the terminalv
const chance = require('chance').Chance()
const fs = require('fs')

let allOpportunities = [] // List of all opportunities to serve an ad against
let tagContent = null

/*
 * IMPORTS & DECLARATIONS SECTION END
 */

/*
 * Load external files and break if needed
 */

if (argv.tag) {
  try {
    tagContent = fs.readFileSync(argv.tag, 'utf8')
    console.log('Tag %s loaded', argv.tag)
  } catch (err) {
    console.log('ERROR: Could not open file')
    process.exit(0)
  }
}

/*
 * Load external files end
 */

/*
 * BIG OLD MAIN()
 */

async function main() {

  const chrome = await chromeLauncher.launch({
    chromeFlags:
    [
 /*     '--disable-features=Translate',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-client-side-phishing-detection',
      '--disable-sync',
      '--metrics-recording-only',
      '--disable-default-apps',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
      '--disable-ipc-flooding-protection',
      '--password-store=basic',
      '--use-mock-keychain',
      '--force-fieldtrials=*BackgroundTracing/default/',
      '--remote-debugging-port=42355',
      '--user-data-dir=/tmp/lighthouse.v3JXofy',
      '--auto-open-devtools-for-tabs',
      '--flag-switches-begin',
      '--flag-switches-end'
*/
      '--enable-setuid-sandbox'

    ],
    userDataDir: argv.userdirectory,
    startingUrl: argv.starturl,
    ignoreDefaultFlags: false,
    handleSIGINT: true
  })

  const protocol = await CDP({ port: chrome.port })
  const { Runtime, Network } = protocol

  await Promise.all([Runtime.enable(), Network.enable()])
  console.log('>> Connected to Chrome on port:%d', chrome.port)

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
      // console.log('NETWORK REFERER: ' + truncateString(request.headers.Referer,70))
      const parsedRequest = isolateQueryString(request.url)
      const ixRequest = tryParseJSON(parsedRequest.r) // One of the reasons this might fail is because some sites seem to be misconfigured and send garbage as bad as <html> docs to the endpoint
      typeof ixRequest !== 'undefined' ? outputIxSiteInfo(ixRequest.site) : console.log('UH OH!! We do not know what site this is?')

      /* Let's check if this is a IX Wrapper Site */
      let ixWrapperSite = false
      let ixWrapperCallback = ''
      if (typeof ixRequest !== 'undefined') {
        if ('fn' in parsedRequest) {
          ixWrapperSite = true
          ixWrapperCallback = parsedRequest.fn
          console.log("This is a wrapper site with fn callback: " + ixWrapperCallback)
        }
      } // We are going to strip the callback from the response later before doing anything else so it looks like prebid

      /* Let's check how many placements exists and whether they are banners or videos */
      if ('imp' in ixRequest && ixRequest !== 'undefined') {
        let bannercount = 0
        let unknowncount = 0
        ixRequest.imp.forEach((element) =>
          'banner' in element ? bannercount += 1 : unknowncount += 1
        )
        console.log('%s banner(s) & %s unknown(s) (unknown means probably video)', bannercount, unknowncount )

        ixRequest.imp.forEach((element) =>
          'banner' in element ? allOpportunities.push({type: 'banner', impid: element.id, width: element.banner.w, height: element.banner.h, sizesig: element.banner.w +"x"+element.banner.h, hasbid: 0, fake: false, injection: false}) :
            console.log('IMPID: %s, %s (maybe video?)', element.id, element.ext)
        ) // end of arrow
      }
        else {
        console.log('No placements have been found in the request. That is rather strange!')
      }

      const response = await Network.getResponseBodyForInterception({ interceptionId })
      let bodyData = response.base64Encoded ? atob(response.body)  : response.body

      // Here we are going to strip the callback from the response in case this is a wrapper call
      if (ixWrapperSite) {
        bodyData = bodyData.slice(ixWrapperCallback.length+1)
        bodyData = bodyData.trim()
        bodyData = bodyData.slice(0, bodyData.length-2)
      }

      let ixResponse = tryParseJSON(bodyData) // One of the resons we might get invalid JSON is if the IX Wrapper is used instead of Prebid. In that case, the answer starts with a publisher specified callback function

      /* Execution Stages */
      // Each stage will get executed in sequence
      let execStage = []

      /* Stage 0 = --replaceprice --replaceadm with --newprice and --filter as flags
       * --nuke kabooms anything and returns first
       * */
      execStage[0] = function () {
        if ('seatbid' in ixResponse) {
          if (argv.nuke) {              // Let's kaboom first
            console.log('NUKING BIDS')
            delete ixResponse.seatbid
            return // That's it folks. Nothing else to see at this execution stage
          }
          // We will sacrifice readability and do everything in the same pass while taking into consideration --newprice and --filter
          if('seatbid' in ixResponse) {
            for (let i=0; i < ixResponse.seatbid.length; i++) {
              if('bid' in ixResponse.seatbid[i]) {
                  for (let j=0; j < ixResponse.seatbid[i].bid.length; j++) { // Jeez, now we finally get to do the actual work
                    let thisDealid = '*'
                    'dealid' in ixResponse.seatbid[i].bid[j].ext ? thisDealid = ixResponse.seatbid[i].bid[j].ext.dealid : thisDealid = '*'

                    if (argv.filter == thisDealid || argv.filter == ixResponse.seatbid[i].bid[j].ext.dealid) {
                      if (argv.replaceprice) // set the new price
                      {
                        ixResponse.seatbid[i].bid[j].price = argv.newprice
                        ixResponse.seatbid[i].bid[j].ext.pricelevel = "_" + argv.newprice
                      }
                      if (argv.replaceadm) // replace the adm if needed
                      {
                        ixResponse.seatbid[i].bid[j].adm = defaultPlaceholderADM(
                          ixResponse.seatbid[i].bid[j].w,
                          ixResponse.seatbid[i].bid[j].h) // The default value of new price when unspecified is zero
                      }


                    }
                    // Surprise BONUS item!!
                      // Since we are already in this monster, we might as well use this iterator
                      // to tag in allOpportunities[] the items that have a bid against them
                      let obj = allOpportunities.find((item) => item.impid === ixResponse.seatbid[i].bid[j].impid)
                      let index = allOpportunities.indexOf(obj)
                      if (typeof obj !== 'undefined') { // Some sites seem to be so misconfigured that this is required. Example: Huffington Post or Welt.de
                        allOpportunities.fill(obj.hasbid+=1, index, index++)
                      }
                  } // bid iteration loop
              } // if there is a bid
            } // seat iteration loop
          }
        }
      }

      execStage[1] = function () { // At this stage we are going to find the first placement that matches the sizesignature injection pattern TODO: This potentially needs improving for all occurences of the size
        if (argv.inject) {
          let injectionSizesig = argv.width + 'x' + argv.height
          console.log(injectionSizesig)
          let obj = allOpportunities.find((item) => item.sizesig === injectionSizesig)
          let index = allOpportunities.indexOf(obj)
          if (typeof obj !== 'undefined') {
            allOpportunities.fill(obj.injection=true, index, index++)
            allOpportunities.fill(obj.hasbid+=1, index, index++)
            allOpportunities.fill(obj.fake=true, index, index++)
            injectNewBid(obj.impid, obj.width, obj.height)
          }
        }
      }

      execStage[2] = function () {
        // Let's check how many opportunities did not receive bids and then create bids if --everything is enable
        if (argv.everything) {
          allOpportunities.forEach((element) =>
            {
                if (!element.hasbid) {
                insertNewBid(element.impid, element.width, element.height)
                element.fake = true
                element.hasbid += 1
              }
            }
          )
        }
      }

      function finalStage() {
        if (ixWrapperSite) {
          ixResponse = ixWrapperCallback + "(" + JSON.stringify(ixResponse) + ");"
        } else {
          ixResponse = JSON.stringify(ixResponse)
        }
        allOpportunities.forEach((item) => item.hasbid > 0 ? console.log(colors.blue('*' + item.type, ' ', item.impid, '\t', item.sizesig, '\tbids:' + item.hasbid + '\tFake:' + item.fake + '\tInjection:' + item.injection)) :
                                console.log(colors.red('-'+item.type, ' ', item.impid, '\t', item.sizesig, '\tbids:'+item.hasbid) ))
       allOpportunities = []
      }

      function insertNewBid(impid, width, height) {
        if (typeof ixResponse.seatbid == 'undefined') {
          ixResponse.seatbid = [defaultSeatBidFragment()]
        }

        if ('bid' in ixResponse.seatbid[0]) {
          ixResponse.seatbid[0].bid.push(defaultBidFragment(impid, width, height))
        } else {
          ixResponse.seatbid[0].bid = [defaultBidFragment(impid, width, height)]
        }
        ixResponse.cur = "USD"
      }

      function injectNewBid(impid, width, height) {
        if (typeof ixResponse.seatbid == 'undefined') {
          ixResponse.seatbid = [defaultSeatBidFragment(argv.seatid)]
        }

        if ('bid' in ixResponse.seatbid[0]) {
          ixResponse.seatbid[0].bid.push(injectionBidFragment(impid, width, height, argv.bid, argv.dealid, argv.advertiser, argv.seatid))
        } else {
          ixResponse.seatbid[0].bid = [injectionBidFragment(impid, width, height, argv.bid, argv.dealid, argv.advertiser, argv.seatid)]
        }
        ixResponse.cur = "USD"
      }

      if (typeof ixResponse !== 'undefined') {
        execStage.forEach((stage) => stage())
        finalStage()
      }

      /* End Execution Stage */

      //if (typeof ixResponse !== 'undefined') {
      //  if ('seatbid' in ixResponse) { ixResponse.seatbid[0].bid[0].price = 1000 ; ixResponse.seatbid[0].bid[0].ext.pricelevel = '_1000' ; ixResponse.seatbid[0].bid[0].adm=defaultPlaceholderADM(ixResponse.seatbid[0].bid[0].h) ;console.log(ixResponse.seatbid[0].bid)}  else { console.log('no bids') }
      //}

      let newHeader = [
        'date: ' + (new Date()).toUTCString(),
        'connection: closed',
        'content-length: ' + btoa(JSON.stringify(ixResponse)).length,
        'content-type: application/json',
        'access-control-allow-credentials: true',
        'access-control-allow-origin: ' + getTopDomain(request.headers.Referer),
        'server: Apache'
      ]

      Network.continueInterceptedRequest({
        interceptionId,
        rawResponse: btoa(
          'HTTP/1.1 200OK\r\n' +
            newHeader.join('\r\n') +
            '\r\n\r\n' +
            ixResponse
        )
      })
    } // async arrow end
  ) // Network.requestIntercepted end
} // Main end

// Utilities followed by main()

function outputIxSiteInfo(site) {
  'ref' in site ? console.log('IX REFERER: ' + truncateString(site.ref,70)) : console.log('NO IX REFERER FOUND') // The IX Referer only exists after you navigate
  'page' in site ? console.log('IX PAGE: ' + truncateString(site.page, 70)) : console.log('NO IX PAGE FOUND') //
}

function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

function isolateQueryString(url) {
  return queryString.parse(url.split('?')[1])
}

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString)
    if (o && typeof o === 'object') {
      return o
    }
  } catch (e) {
    console.log("Something is not JSON here. Very fishy!")
  }
}

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

function defaultPlaceholderADM(width, height, fake) {
  // Having to pass in the height is a total hack job. Any suggestions on what is wrong with the CSS are welcome.
  // I couldnt get the tag to inherit the height of the iframe container
  if (fake) { // The fake creative has a red border
    return "<style type=\"text\/css\">#ad { position: relative; height: " +(height-2)+"px; width:"+(width-2)+"px; border: 1px solid red; background-color: white }  #ad .bg { position: relative; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 90%; height: 80%; background-repeat: no-repeat; background-position: center; background-image: url(\"data:image\/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 400 511\' version=\'1.1\' xmlns=\'http:\/\/www.w3.org\/2000\/svg\' xmlns:xlink=\'http:\/\/www.w3.org\/1999\/xlink\' xml:space=\'preserve\' xmlns:serif=\'http:\/\/www.serif.com\/\' style=\'fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\'%3E%3Cg transform=\'matrix(1,0,0,1,-440.132,-144.659)\'%3E%3Cpath d=\'M839.868,144.659L839.868,655.341L440.132,655.341L440.132,144.659L839.868,144.659ZM726.485,539.947L726.485,535.051C726.485,525.209 725.529,518.235 723.617,514.13C721.704,510.024 717.803,506.62 711.913,503.918C706.023,501.215 698.896,499.863 690.533,499.863C682.883,499.863 676.356,501.1 670.95,503.573C665.544,506.047 661.63,509.476 659.208,513.862C656.786,518.248 655.575,525.183 655.575,534.668C655.575,541.247 656.429,546.653 658.137,550.885C659.846,555.118 662,558.433 664.601,560.83C667.202,563.226 672.505,567.077 680.512,572.38C688.518,577.633 693.542,581.381 695.581,583.625C697.57,585.869 698.565,590.637 698.565,597.93C698.565,601.244 698.042,603.743 696.997,605.426C695.951,607.109 694.357,607.95 692.216,607.95C690.074,607.95 688.582,607.287 687.741,605.962C686.899,604.636 686.479,601.652 686.479,597.012L686.479,581.942L656.569,581.942L656.569,590.051C656.569,599.332 657.513,606.497 659.399,611.546C661.286,616.594 665.277,620.751 671.371,624.014C677.465,627.278 684.821,628.91 693.44,628.91C701.293,628.91 708.178,627.495 714.093,624.665C720.009,621.834 723.999,618.328 726.065,614.146C728.13,609.965 729.163,603.463 729.163,594.64C729.163,582.503 727.301,573.706 723.578,568.25C719.856,562.793 710.827,555.81 696.491,547.302C691.492,544.347 688.458,541.823 687.39,539.73C686.273,537.638 685.714,534.525 685.714,530.392C685.714,527.177 686.211,524.778 687.205,523.196C688.2,521.614 689.666,520.823 691.604,520.823C693.389,520.823 694.663,521.409 695.428,522.582C696.193,523.755 696.576,526.484 696.576,530.767L696.576,539.947L726.485,539.947ZM807.493,539.947L807.493,535.051C807.493,525.209 806.537,518.235 804.625,514.13C802.712,510.024 798.811,506.62 792.921,503.918C787.031,501.215 779.904,499.863 771.541,499.863C763.891,499.863 757.364,501.1 751.958,503.573C746.552,506.047 742.638,509.476 740.216,513.862C737.794,518.248 736.583,525.183 736.583,534.668C736.583,541.247 737.437,546.653 739.145,550.885C740.854,555.118 743.008,558.433 745.609,560.83C748.21,563.226 753.513,567.077 761.52,572.38C769.526,577.633 774.549,581.381 776.589,583.625C778.578,585.869 779.573,590.637 779.573,597.93C779.573,601.244 779.05,603.743 778.004,605.426C776.959,607.109 775.365,607.95 773.224,607.95C771.082,607.95 769.59,607.287 768.749,605.962C767.907,604.636 767.486,601.652 767.486,597.012L767.486,581.942L737.577,581.942L737.577,590.051C737.577,599.332 738.52,606.497 740.407,611.546C742.294,616.594 746.285,620.751 752.379,624.014C758.473,627.278 765.829,628.91 774.447,628.91C782.301,628.91 789.185,627.495 795.101,624.665C801.017,621.834 805.007,618.328 807.072,614.146C809.138,609.965 810.171,603.463 810.171,594.64C810.171,582.503 808.309,573.706 804.586,568.25C800.864,562.793 791.834,555.81 777.499,547.302C772.5,544.347 769.466,541.823 768.398,539.73C767.28,537.638 766.721,534.525 766.721,530.392C766.721,527.177 767.219,524.778 768.213,523.196C769.208,521.614 770.674,520.823 772.612,520.823C774.396,520.823 775.671,521.409 776.436,522.582C777.201,523.755 777.584,526.484 777.584,530.767L777.584,539.947L807.493,539.947ZM652.783,626.309L634.366,502.464L587.819,502.464L571.392,626.309L604.687,626.309L606.623,604.049L618.142,604.049L619.871,626.309L652.783,626.309ZM565.77,626.309L565.77,502.464L523.87,502.464L516.469,560.294L511.896,528.793C510.584,518.686 509.31,509.91 508.074,502.464L466.403,502.464L466.403,626.309L494.553,626.309L494.591,544.613L506.41,626.309L526.375,626.309L537.582,542.7L537.62,626.309L565.77,626.309ZM617.299,582.095C615.669,568.068 614.034,550.729 612.393,530.079C609.113,553.793 607.053,571.132 606.213,582.095L617.299,582.095Z\' style=\'fill:url(%23_Linear1);\'\/%3E%3C\/g%3E%3Cdefs%3E%3ClinearGradient id=\'_Linear1\' x1=\'0\' y1=\'0\' x2=\'1\' y2=\'0\' gradientUnits=\'userSpaceOnUse\' gradientTransform=\'matrix(1.90476,596.19,-596.19,1.90476,400,-125.714)\'%3E%3Cstop offset=\'0\' style=\'stop-color:black;stop-opacity:1\'\/%3E%3Cstop offset=\'0.58\' style=\'stop-color:black;stop-opacity:1\'\/%3E%3Cstop offset=\'1\' style=\'stop-color:black;stop-opacity:1\'\/%3E%3C\/linearGradient%3E%3C\/defs%3E%3C\/svg%3E%0A\");  }<\/style><div id=\"ad\"><div class=\"bg\"><\/div><\/div>"
  } else {
    return "<style type=\"text\/css\">#ad { position: relative; height: " +(height-2)+"px; width:"+(width-2)+"px; border: 1px solid black; background-color: white }  #ad .bg { position: relative; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 90%; height: 80%; background-repeat: no-repeat; background-position: center; background-image: url(\"data:image\/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 400 511\' version=\'1.1\' xmlns=\'http:\/\/www.w3.org\/2000\/svg\' xmlns:xlink=\'http:\/\/www.w3.org\/1999\/xlink\' xml:space=\'preserve\' xmlns:serif=\'http:\/\/www.serif.com\/\' style=\'fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;\'%3E%3Cg transform=\'matrix(1,0,0,1,-440.132,-144.659)\'%3E%3Cpath d=\'M839.868,144.659L839.868,655.341L440.132,655.341L440.132,144.659L839.868,144.659ZM726.485,539.947L726.485,535.051C726.485,525.209 725.529,518.235 723.617,514.13C721.704,510.024 717.803,506.62 711.913,503.918C706.023,501.215 698.896,499.863 690.533,499.863C682.883,499.863 676.356,501.1 670.95,503.573C665.544,506.047 661.63,509.476 659.208,513.862C656.786,518.248 655.575,525.183 655.575,534.668C655.575,541.247 656.429,546.653 658.137,550.885C659.846,555.118 662,558.433 664.601,560.83C667.202,563.226 672.505,567.077 680.512,572.38C688.518,577.633 693.542,581.381 695.581,583.625C697.57,585.869 698.565,590.637 698.565,597.93C698.565,601.244 698.042,603.743 696.997,605.426C695.951,607.109 694.357,607.95 692.216,607.95C690.074,607.95 688.582,607.287 687.741,605.962C686.899,604.636 686.479,601.652 686.479,597.012L686.479,581.942L656.569,581.942L656.569,590.051C656.569,599.332 657.513,606.497 659.399,611.546C661.286,616.594 665.277,620.751 671.371,624.014C677.465,627.278 684.821,628.91 693.44,628.91C701.293,628.91 708.178,627.495 714.093,624.665C720.009,621.834 723.999,618.328 726.065,614.146C728.13,609.965 729.163,603.463 729.163,594.64C729.163,582.503 727.301,573.706 723.578,568.25C719.856,562.793 710.827,555.81 696.491,547.302C691.492,544.347 688.458,541.823 687.39,539.73C686.273,537.638 685.714,534.525 685.714,530.392C685.714,527.177 686.211,524.778 687.205,523.196C688.2,521.614 689.666,520.823 691.604,520.823C693.389,520.823 694.663,521.409 695.428,522.582C696.193,523.755 696.576,526.484 696.576,530.767L696.576,539.947L726.485,539.947ZM807.493,539.947L807.493,535.051C807.493,525.209 806.537,518.235 804.625,514.13C802.712,510.024 798.811,506.62 792.921,503.918C787.031,501.215 779.904,499.863 771.541,499.863C763.891,499.863 757.364,501.1 751.958,503.573C746.552,506.047 742.638,509.476 740.216,513.862C737.794,518.248 736.583,525.183 736.583,534.668C736.583,541.247 737.437,546.653 739.145,550.885C740.854,555.118 743.008,558.433 745.609,560.83C748.21,563.226 753.513,567.077 761.52,572.38C769.526,577.633 774.549,581.381 776.589,583.625C778.578,585.869 779.573,590.637 779.573,597.93C779.573,601.244 779.05,603.743 778.004,605.426C776.959,607.109 775.365,607.95 773.224,607.95C771.082,607.95 769.59,607.287 768.749,605.962C767.907,604.636 767.486,601.652 767.486,597.012L767.486,581.942L737.577,581.942L737.577,590.051C737.577,599.332 738.52,606.497 740.407,611.546C742.294,616.594 746.285,620.751 752.379,624.014C758.473,627.278 765.829,628.91 774.447,628.91C782.301,628.91 789.185,627.495 795.101,624.665C801.017,621.834 805.007,618.328 807.072,614.146C809.138,609.965 810.171,603.463 810.171,594.64C810.171,582.503 808.309,573.706 804.586,568.25C800.864,562.793 791.834,555.81 777.499,547.302C772.5,544.347 769.466,541.823 768.398,539.73C767.28,537.638 766.721,534.525 766.721,530.392C766.721,527.177 767.219,524.778 768.213,523.196C769.208,521.614 770.674,520.823 772.612,520.823C774.396,520.823 775.671,521.409 776.436,522.582C777.201,523.755 777.584,526.484 777.584,530.767L777.584,539.947L807.493,539.947ZM652.783,626.309L634.366,502.464L587.819,502.464L571.392,626.309L604.687,626.309L606.623,604.049L618.142,604.049L619.871,626.309L652.783,626.309ZM565.77,626.309L565.77,502.464L523.87,502.464L516.469,560.294L511.896,528.793C510.584,518.686 509.31,509.91 508.074,502.464L466.403,502.464L466.403,626.309L494.553,626.309L494.591,544.613L506.41,626.309L526.375,626.309L537.582,542.7L537.62,626.309L565.77,626.309ZM617.299,582.095C615.669,568.068 614.034,550.729 612.393,530.079C609.113,553.793 607.053,571.132 606.213,582.095L617.299,582.095Z\' style=\'fill:url(%23_Linear1);\'\/%3E%3C\/g%3E%3Cdefs%3E%3ClinearGradient id=\'_Linear1\' x1=\'0\' y1=\'0\' x2=\'1\' y2=\'0\' gradientUnits=\'userSpaceOnUse\' gradientTransform=\'matrix(1.90476,596.19,-596.19,1.90476,400,-125.714)\'%3E%3Cstop offset=\'0\' style=\'stop-color:black;stop-opacity:1\'\/%3E%3Cstop offset=\'0.58\' style=\'stop-color:black;stop-opacity:1\'\/%3E%3Cstop offset=\'1\' style=\'stop-color:black;stop-opacity:1\'\/%3E%3C\/linearGradient%3E%3C\/defs%3E%3C\/svg%3E%0A\");  }<\/style><div id=\"ad\"><div class=\"bg\"><\/div><\/div>"
  }
}

function injectionBidFragment(impid, width, height, bid, dealid = 'MASS', advertiser = chance.name(), seatid) {
  let tag = '<script>var x=\"mass:\/\/inskin\/pageskin?eyJwbHJfTWFuaWZlc3RVcmwiOiJodHRwczovL2Nkbi5pbnNraW5hZC5jb20vQ3JlYXRpdmVTdG9yZS9wcy8yMDE3LTEwLzU5ZGUxMDdhZDI4NjYzNDVlMTk1MTBjZl8xL21hbmlmZXN0Lmpzb24ifQ==\"; console.log(\'Original ADM Executed\')<\/script>'
  if (tagContent) {
    tag = tagContent
  }

  let obj = {
    adid: chance.fbid(),
    adm: tag,
    adomain: [chance.domain()],
    cid: chance.fbid(),
    crid: chance.fbid(),
    aid: chance.fbid(),
    ext: {
      advbrand: advertiser,
      dspid: chance.fbid(),
      pricelevel: "_" + argv.bid,
      advbrandid: chance.fbid(),
      dealid: dealid
    },
    h: height,
    id: impid,
    impid: impid,
    price: bid,
    w: width,
    seat: seatid
  }

  // Insert the meta field for OpenRTB transactions in case it is set
  if (argv.meta) {
    if (typeof obj.meta !== 'undefired') {
      obj.meta = { mass: true }
    } else {
      obj.meta.mass = true
    }
  }

  return obj
}

function defaultBidFragment(impid, width, height) {
  let obj = {
    adid: chance.fbid(),
    adm: defaultPlaceholderADM(width, height, true),
    adomain: [chance.domain()],
    cid: chance.fbid(),
    crid: chance.fbid(),
    aid: chance.fbid(),
    ext: {
      advbrand: chance.name(),
      dspid: chance.fbid(),
      pricelevel: "_" + argv.newprice,
      advbrandid: chance.fbid()
    },
    h: height,
    id: impid,
    impid: impid,
    price: argv.newprice,
    w: width,
    seat: chance.fbid()
  }
  return obj
}

function defaultSeatBidFragment(seat = chance.fbid()) {
  let obj = {
    seat: seat,
    bid: []
  }
  return obj
}

main()

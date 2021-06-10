# MASS BIDSIM

Command line tool to simulate bids from Exchanges for Linux, Windows & MacOS

## Installation
Requires NodeJS 16.x and the NPM tool.
For the tool to run, the Chrome environment variable for the runtime must be set. (This should be the case for most installations of Chrome as a default)

``` bash
git clone https://github.com/massplatform/bidsim
cd bidsim
npm install
```

## Usage Example

```bash
node bidsim --help
node --userdirectory "C:\Users\[USERNAME]\AppData\Local\Google\Chrome\User Data"
```
Replace all incoming bids with a new ADM and new price. Also bid on every available placement remaining with a fake bid at 10 dollars
``` bash
node bidsim -pren 1000
node --replaceprice --replaceadm --everything --newprice 1000
```
Remove all bids and replace them with fake bids
``` bash
node bidsim -xe -n 1000
```
Inject a specific bid with a DealID
``` bash
node bidsim --inject --bid 2000 --width 300 --height 250 --dealid 'MASS' --tag "[Path to tag]"
```

In general, anything injection related occurs after -p -r -n -f -x and -e

## Full List of Options

``` bash
  -p, --replaceprice    Sets all prices to zero       [boolean] [default: false]
  -r, --replaceadm      Replaces all ADM fields       [boolean] [default: false]
  -n, --newprice        New price if replaceprice=true     [number] [default: 0]
  -f, --filter          Replace only matching DealID     [string] [default: "*"]
  -x, --nuke            Nuke all bids that came back  [boolean] [default: false]
  -e, --everything      bid on everything             [boolean] [default: false]
  -i, --inject          Inject new bid                [boolean] [default: false]
  -w, --width           Width of ad to inject          [number] [default: "300"]
  -h, --height          Height of ad to inject         [number] [default: "250"]
  -b, --bid             Bid price of ad to inject     [number] [default: "1000"]
  -d, --dealid          Dealid of ad to inject          [string] [default: null]
  -t, --tag             [filepath] of tag to inject     [string] [default: null]
  -a, --advertiser      Advertiser to inject      [string] [default: "My Brand"]
  -m, --meta            OpenRTB Meta                  [boolean] [default: false]
  -s, --seatid          SeatID of buyer to inject    [string] [default: "12345"]
  -o, --starturl        Page to open at start  [string] [default: "about:blank"]
  -u, --userdirectory   Optional Chrome user dir          [string] [default: ""]
  -P, --chromeport      Optional chrome debug port    [string] [default: "auto"]
  -F, --flagsfile       Override chrome flags file
                        (Requires chromeport)          [string] [default: false]
  -q, --defaulttag      Default substitution tag       [string] [default: false]
  -z, --defaultfaketag  Default fake tag               [string] [default: false]
  -B, --block           Block using block/default.json[boolean] [default: false]
  -L, --blockfile       Custom file with --block rules
                                                   [string] [default: "default"]
  -?, --help            Show help                                      [boolean]
  -v, --version         Show version number                            [boolean]
  ```bash

# getNetworkStats() Demo

This demo joins a call and polls the `getNetworkStats()` endpoint every 2 seconds, charting the results. It also marks important connection events such as when a websocket is interrupted/re-connected or when the threshold category changes.

## Setup

1. Setup your room url constant
   ```
   $ cp js/_consts.js js/consts.js
   # modify contents of js/consts.js
   ```
2. Build
   ```
   $ npm i
   $ npm run build
   ```

## Run

1. Run the dev server
    ```
    $ npm run start
    ```
2. Click 'join' to join the call. Graphs should update every 2 seconds with latest stat values.


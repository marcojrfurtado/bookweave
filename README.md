# bookweave

Share and search eBooks on the Permaweb.

## Live

Latest version (v1.0) is currently live on https://arweave.net/asf

## Limitations

Please be aware that that latest version currently has the following limitations:

* Search: bookweave relies on [ArQL](https://github.com/ArweaveTeam/arweave-js) for providing search capabilities. For this reason, only exact matches for author, title or ISBN are supported. The matching is, however, case-insensitive;

* ISBN: Given that only exact matches are enabled, ISBN should be the most appropriate search option to be used. However, there is not a good way to obtain them most of the time. You would think that most epub files would use this field as an identifier, but that is not the case. ISBN is just not provided as part of the metadata lots of times. If you have a suggestion, please make sure to raise an issue.

## How to obtain an AR tokens?

Arweave is current distributing free tokens on https://tokens.arweave.org/. Make sure to grab it while it lasts.

## Running it locally

Assuming you are using Bash, you can simply
```
npm install
DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
```

The open [http://localhost:3000](http://localhost:3000) to view it in the browser.



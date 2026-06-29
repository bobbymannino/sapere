# Sapere

Sapere (_sa-pay-ree_) is a completely free and open source software. It is
created an alternative to [plane.so](https://plane.so). It does not have nearly
the amount of features or consistent activity.

This project was created because I did not want to pay for the GitHub
integration for that service. I do still love Plane and will continue to praise
it.

## Files

In [files.ts](src/lib/server/files.ts), there is an adapter for managing file
storage. I have used minio as that is how I host it but you can easily change
this using [files-sdk](https://files-sdk.dev/).

## Analytics

Current in [analytics.svelte](src/routes/analytics.svelte), there is a setup
that is specific to me. If you fork or use this project it is required that you
remove this out and if you choose to, add your own analytics.

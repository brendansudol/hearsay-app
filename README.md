**hearsay** is a small tool powered by AI (Whisper for transcriptions, GPT-4 for
summaries) to enrich audio files. The app is simple: add a URL to an audio file (up to 250 MB), and then get a full transcript (and a tl;dr summary) on its own page that you can share or revisit later.

Large files are split up into smaller chunks and transcribed in parallel to improve performance. This is done via an AWS Lambda function ([source code](https://github.com/brendansudol/hearsay-lambdas)) that is triggered from the `transcribe` API endpoint.

https://try-hearsay.vercel.app/

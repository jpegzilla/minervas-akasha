# minerva voice

-   feature name: minerva voice
-   start date: 2020.03.25
-   source location: `/src/utils/managers/MinervaVoice.js`

## summary

minerva voice is a rudimentary speech synthesis engine designed to enhance user experience through personification of minerva by giving her a voice. it is loosely based on the functionality of the vocaloid and utau software vocal synthesizers.

therefore, it uses similar methodology to simulate a speaking voice (stringing together pre-recorded phonemes to form sentences). calling the `speak()` method with a string passed in as the sentence you want to speak will cause minerva to say each letter in your string in quick succession in her unique, robotic voice.

## motivation

I did this for no other reason other than vocaloid changed my life and I thought it would be cool to make my own rudimentary 'vocal synthesis engine'.

## guide-level explanation

basically, minerva has a set of samples that correspond to letters and sounds, just like a vocaloid voicebank. when a phrase is fed to her `speak()` function, or a letter to her `say()` function, those letters are sounded individually, with slight random variation in pitch. this makes minerva sound like a robotic animal crossing villager (which my technique is slightly based on).

## drawbacks

some people might not like the voice, so there is a volume control just for it.

# contributing:

hello! thanks for considering helping me make minerva's akasha better.

minerva's akasha is very well commented and soon to be very well documented. I aim to make it extremely easy to create additions / modifications to this application (given you know javascript / sass / html). once this software reaches beta, I hope that some people will develop useful additions / plugins for it.

as of version 0.1, the software hasn't actually been released, so there's not much contributing to be done. I will update this when the software nears a production-ready state.

# submitting feedback and bug reports

in order to submit a bug report, click [here](https://github.com/jpegzilla/minervas-akasha/issues/new?assignees=jpegzilla&labels=bug&template=bug-report.md&title=%5Bbug%5D). I will review the bug report and discuss it with you, and then I can fix it!

in order to give me general feedback, please contact me directly: twitter (@jpegzilla), discord (jpegzilla#6969), and email all work.

# adding features, fixing bugs, etc...

if you want to contribute code to minerva's akasha, first read the [style guide](https://github.com/jpegzilla/minervas-akasha/blob/master/docs/main/style-guide.md).

then, do this 8-step process:

1.  fork this repository and clone the repo onto your computer
2.  add this repo as an upstream to that repo: `https://github.com/jpegzilla/minervas-akasha.git`
3.  get latest changes:
```
git checkout master
git fetch --all
git merge upstream/master
```
4.  install all deps: `yarn install`
5.  create a feature branch from my master branch
6.  make the feature / fix / whatever and commit the changes to your own branch
7.  make a pr from your branch to my master.
8.  I will review it and merge it if the change is acceptable. done!

if you added a new feature, create a file in `/docs/main` called `your-feature-name.design.md` that describes the feature. take a look at the existing design docs for examples. this will help me add it to the wiki, and keep the software well-documented

also, it doesn't hurt to talk to me about things you want to add to minerva's akasha. I can easily be contacted on discord at `jpegzilla#6969` or on twitter `@jpegzilla`, or email me.

_\~ more contribution info coming soon\~_

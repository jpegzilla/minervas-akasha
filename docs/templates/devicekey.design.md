# DeviceKey

-   feature name: `DeviceKey` class
-   start date: 12.2.2020
-   source location: `/src/utils/managers/DeviceKey.js`

## summary
[summary]: #summary

`DeviceKey` is a class designed for generating and validating device keys, which are for users to verify ownership of data when they try to retrieve data on a different device than the one they created their account on.

## motivation
[motivation]: #motivation

this is the way that users will be able to access their data between devices.

## explanation
[explanation]: #explanation

there are two main methods in this class: `generate` and `verify`. there are also synchronous versions of these methods, for which the last parameter is a callback function. these are `generateSync` and `verifySync` respectively.

to generate a device key, call `DeviceKey.generate`, passing in a user id as the only parameter. this will give you an array of six generated device keys for that user only.

to verify a device key, pass in one generated key and the user id for which that key was generated. this will give you true if the key was valid, false if not.

## drawbacks
[drawbacks]: #drawbacks

-   currently, the only way I can see to invalidate a device key would be to change the user's id and probably password.

## rationale and alternatives
[rationale-and-alternatives]: #rationale-and-alternatives

currently I think this is a very simple, straightforward, utilitarian design for a device key.

an alternative could be to use a totp system.

## unresolved questions
[unresolved-questions]: #unresolved-questions

-   how to invalidate?

-   how to store in a sensible way (not in localstorage)?

-   I don't know what I'd do if a user needed more than six device keys for whatever reason.

-   I don't know how I'd invalidate these (short of having the user change their user id and somehow reconstructing their data with the new id) if a user's information was somehow compromised.

# Changelog

## v5.0.0 — 20/05/2026


### Correcciones


- Conflicting folder ([96ff12c](https://github.com/KeaKit/KeaKit/commit/96ff12c486f72c815a2c2e589ff21541baaea0dd))

- Delete docs/PPL directory ([cb67474](https://github.com/KeaKit/KeaKit/commit/cb67474d6e568f02556eb1749768106e6e5acddd))

- Correct text and improve clarity ([1986d7f](https://github.com/KeaKit/KeaKit/commit/1986d7f45d211dbef383d413efb7ea07e818280b))

- Reconcile guarantee refunds ([7e9a5bf](https://github.com/KeaKit/KeaKit/commit/7e9a5bf7a76ab049eba63dcd88e88de31a24b056))

- Prevent early article returns ([71b63e9](https://github.com/KeaKit/KeaKit/commit/71b63e99063b36129778816dedeab6a8cd81e041))

- Fixed security config ([194b575](https://github.com/KeaKit/KeaKit/commit/194b5755ec2ff416152fae6c5894dd5c7464850f))

- Default status for new articles ([088c0b7](https://github.com/KeaKit/KeaKit/commit/088c0b7b6778cd2daffa6d3e073eaac68970761b))

- Add custom pattern validator to all email fields ([1440b80](https://github.com/KeaKit/KeaKit/commit/1440b80378fc4087951991d1dc1d6f462ac27737))

- Add relation from User side to RgpdConsent so the second one is deleted in cascade ([2855cff](https://github.com/KeaKit/KeaKit/commit/2855cffdb634af7474a611b7059ccef66d69f6de))

- Frontend article price modification fixed ([d281d19](https://github.com/KeaKit/KeaKit/commit/d281d197473c99c9fc90120da14eb9bb90121a20))

- Fix ketServiceTest ([d14e7fd](https://github.com/KeaKit/KeaKit/commit/d14e7fd7183f1b3bef84b014a1903e44df94f8c9))

- Remove unnecesary coming soon features at AdminHome and HeaderNavbar ([7fe42b4](https://github.com/KeaKit/KeaKit/commit/7fe42b44e2c1bb4e8947201d9d6afc14f28c339c))

- Delete unused AdminProfileMenuModal ([0adfdf0](https://github.com/KeaKit/KeaKit/commit/0adfdf076656887d497fbced331ef4b071410518))

- Delete unused PresetProductSelectionModal ([af7ffce](https://github.com/KeaKit/KeaKit/commit/af7ffce8b4ae7300cf6319e3b57124177d09bf24))

- Delete unused CustomIcon ([c7664df](https://github.com/KeaKit/KeaKit/commit/c7664df494c07801182832f20da07306a1156ba3))

- Fix: add category length validation ([2af0c9b](https://github.com/KeaKit/KeaKit/commit/2af0c9bb10469d92c8deabcdffb396766334f4a7))

- Category cannot be DRAFT ([035c8b7](https://github.com/KeaKit/KeaKit/commit/035c8b7f229a6133ad0704f971b51ba624e84ad8))

- Null point exception fixed ([4a52ebf](https://github.com/KeaKit/KeaKit/commit/4a52ebfd70af2f84e21b9999cb145e19a3a83fb1))

- Minimum price when searching for products is now 0 ([3820ef1](https://github.com/KeaKit/KeaKit/commit/3820ef15758c8ff01ea202dee7782d39b971fc84))

- Different messages for rented and paid ([8422b8d](https://github.com/KeaKit/KeaKit/commit/8422b8d22fb5786be6812ecf88daafc96930f4b5))

- Now both messages work ([bbecde2](https://github.com/KeaKit/KeaKit/commit/bbecde20c653e087e1c206ab83de1c4868c2fbb9))

- Control error 500 when paying with wallet ([fa1887f](https://github.com/KeaKit/KeaKit/commit/fa1887f8e018065b5a0381989dfe5ea426fb92c0))

- Apply same pattern to all phone validators ([08c2fb1](https://github.com/KeaKit/KeaKit/commit/08c2fb1addbea67bd8136810e3bb7e81bf264ade))

- Show all notifications when clicking on the bell ([e4f1d1e](https://github.com/KeaKit/KeaKit/commit/e4f1d1e1cba909f117ba40ab1deb5a17cd58d301))

- Fix notifications now always loading ([79c95c0](https://github.com/KeaKit/KeaKit/commit/79c95c0b1ef21ed7f0738475cfd871109dc574fc))

- Remove unnecessary grey color ([82306cd](https://github.com/KeaKit/KeaKit/commit/82306cd1063f330685cb0f6425e79e1d5a96cdc9))

- Fix seeder delivery status ([87ac25c](https://github.com/KeaKit/KeaKit/commit/87ac25ca2f1e986e302f0cf02122f357d97f9d21))

- Remove unnecessary date ([dbf15bc](https://github.com/KeaKit/KeaKit/commit/dbf15bc3ed3af0ca1b05678c7dc6bd5ae13985d0))


### Novedades


- Change AdminHomeScreen style ([9721490](https://github.com/KeaKit/KeaKit/commit/9721490b9a09c0a5d314b74f33cd0f2c91e4a29e))

- Add minimum withdrawal amount validation and error handling ([d3cd59c](https://github.com/KeaKit/KeaKit/commit/d3cd59cb7e5a2ef467454206df633e694098e8e8))

- Enhance transaction model with payout subtype and description, update wallet and transaction handling ([42407b9](https://github.com/KeaKit/KeaKit/commit/42407b9f1236195966f78e0a6abbc30a4ab99c9a))

- Enhance withdrawToBank method with test mode handling and improved error messages ([0d561ef](https://github.com/KeaKit/KeaKit/commit/0d561ef88623e46fb4708e0ecb8478885305a663))

- Update contributions and feedback from WPL review ([e2ae899](https://github.com/KeaKit/KeaKit/commit/e2ae89993ee5c3a3fa2ea4f0dbf8143ee0b25d9d))

- Add contributions knowledge base report ([acaca74](https://github.com/KeaKit/KeaKit/commit/acaca747a8d5f89b863d3f66f0b02fca0fd8d953))


### test


- Update withdrawToBank test to verify no Stripe call in test mode ([bb03ed1](https://github.com/KeaKit/KeaKit/commit/bb03ed1ef7970e72b1e70be15d4653e134da3045))


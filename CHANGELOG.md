# Changelog

## v4.0.0 — 13/05/2026


### Correcciones


- Bucle de toggleStatus para los articles del kit ([98020ba](https://github.com/KeaKit/KeaKit/commit/98020baf1a9612017ad5240ce3ec0cf1a4b205de))

- Fix codacy warnings ([b49500f](https://github.com/KeaKit/KeaKit/commit/b49500f64a09e51dadc49964e303976cdf2276cf))

- Add unauthorized exception throw when token is expired ([083f420](https://github.com/KeaKit/KeaKit/commit/083f4200b775c720e9eab9f0af13430f2c5356a8))

- Uncorrectly used Unauthorized Exception ([6cfa047](https://github.com/KeaKit/KeaKit/commit/6cfa047f02c2f964f72c852fd437cb01a6f252bb))

- Fix failing tests due to exception type change ([ce81a5b](https://github.com/KeaKit/KeaKit/commit/ce81a5bde8f7476f820a0469afd90ef02b3279a7))

- Correct table formatting in cost estimation document ([59eaebb](https://github.com/KeaKit/KeaKit/commit/59eaebbd97d0611a61c818f20aeb98c78e629c08))

- Add missing controller ([7f992be](https://github.com/KeaKit/KeaKit/commit/7f992bec143213f2df13c06d02a5d7f2cbf5c33c))

- Wrong endpoint ([fe0f248](https://github.com/KeaKit/KeaKit/commit/fe0f2489cae110ac90374380308a6cc5f8e8f6a3))

- Move toggle rent logic to backend ([9f22688](https://github.com/KeaKit/KeaKit/commit/9f22688a4bc8a9f16a5f6603a9120d01667ec78f))

- Allow 0 as price per month as requested in business rules ([8dec3c6](https://github.com/KeaKit/KeaKit/commit/8dec3c697668fc0dfbd905e151acde8e561d4c9f))

- Correct seeder rented articles data ([0b9411b](https://github.com/KeaKit/KeaKit/commit/0b9411b1d9c26e26306230d82dfa9f61294dc381))

- Default kits articles appear in map when selecting ([51683a6](https://github.com/KeaKit/KeaKit/commit/51683a64cbdf33cb3a85a28d0943fff641ae7468))

- Parse dinamically commas to dots in CommissionScreen ([35b4c83](https://github.com/KeaKit/KeaKit/commit/35b4c8395a583fb45c035cf51977f4d1daddfe11))

- Add scroll to admin edit users screen ([45b8339](https://github.com/KeaKit/KeaKit/commit/45b83394d3c46f7152bf4dae8909f8fbcf77a20d))

- Fix failing tests due to kit payments miscalculation ([172b6c0](https://github.com/KeaKit/KeaKit/commit/172b6c057d0f7fcae56822940114fcbf56df9594))

- Add validation for title and total units in article and service screens ([e0b639a](https://github.com/KeaKit/KeaKit/commit/e0b639acbfcb832a71b47d89ae0f6f341b3236ea))

- Add validation for kit name, country, and city length in create kit process ([dcdb268](https://github.com/KeaKit/KeaKit/commit/dcdb2680d78174c209a21591f742990aad37b506))

- Add price validation and error handling in MyArticlesScreen ([5833ac9](https://github.com/KeaKit/KeaKit/commit/5833ac9b2de93b1ba0596da5433c4d5d0d271e2c))

- Now every item shows when modifiyng existing default kit ([c339e8d](https://github.com/KeaKit/KeaKit/commit/c339e8d2649aa30426e488c173a550e61847f41c))

- Provisional fix to article not found error with services ([f8fc61b](https://github.com/KeaKit/KeaKit/commit/f8fc61b6ee40e649ac47c0f015512dc636766fcf))

- Remove unnecessary function ([b9ffb97](https://github.com/KeaKit/KeaKit/commit/b9ffb97d3a6b96620808e50c4d6d598b4af85ed4))

- Delegate exception handling at PromoCodeController to GlobalExceptionHandler ([70128ff](https://github.com/KeaKit/KeaKit/commit/70128ff4ee4d2d2a1bc0e52d7c07af7fecdc91ab))

- Change error handling at PromoCodeFormScreen ([d139526](https://github.com/KeaKit/KeaKit/commit/d13952607e73c34c76f2aed5d570893d27fd0450))

- Change RuntimeException to PromoCodeAlreadyExistsException in PromoCodeServiceTest ([01dd728](https://github.com/KeaKit/KeaKit/commit/01dd7282ede302c1cabb4d597e56df14b799bfca))

- Delegate error handling to GlobalExceptionHandler when getting promo code by id ([31af340](https://github.com/KeaKit/KeaKit/commit/31af3405fcb809a9cd0bed2ab709985eb021c079))

- Eliminar otras funcionalidades de la pagina de repartidor ([b7c654c](https://github.com/KeaKit/KeaKit/commit/b7c654c50a49b626a72a83c189a26a48f9047666))

- Add token version property to user table to detect when an admin modifies an active user account ([33cfff2](https://github.com/KeaKit/KeaKit/commit/33cfff2e832a1a9af5bd9eacfec89eaad9f75e39))

- Invalidate session when admin changes user details ([9aea81f](https://github.com/KeaKit/KeaKit/commit/9aea81fc1b6bec984f087c22aaaa0049ca4c833b))

- Add tokenVersion to token build in all places that it's built ([f8bd76b](https://github.com/KeaKit/KeaKit/commit/f8bd76bfa0876dfb48ff86bb8d64848568fd167f))

- Bugs in item filtering by date range ([415c526](https://github.com/KeaKit/KeaKit/commit/415c526a1a17de3deccf61f66679aad538b167ef))

- Test filterItemsForKit with new parameters ([744453d](https://github.com/KeaKit/KeaKit/commit/744453d5be8babc259099dd9d04c0fde084ab011))

- Fixed tests by adding article repository ([66f57c3](https://github.com/KeaKit/KeaKit/commit/66f57c37fca501c3d578a01b839708f6ff88373c))

- Price filtering for admin ([b39ed6c](https://github.com/KeaKit/KeaKit/commit/b39ed6c37a224949e233bad375193feeb1b8a0a9))

- Availability incongruity ([8760b92](https://github.com/KeaKit/KeaKit/commit/8760b92bc695eaead93ed9076fc85d26ed9468fe))

- Navigation in admin incident screen now works as intended ([bb5a347](https://github.com/KeaKit/KeaKit/commit/bb5a34791b3b66a374e75a76503c58ccca49a62c))

- Services now change units depending on the date ([7753310](https://github.com/KeaKit/KeaKit/commit/7753310d64cf89ffbca36887b22f7a134ee65c9a))

- Comments ([bdd6d6a](https://github.com/KeaKit/KeaKit/commit/bdd6d6a658ee7378a6fe4500f0c344cf4b8521a7))

- Item unlinks when changing incident type ([6dd9b56](https://github.com/KeaKit/KeaKit/commit/6dd9b56ab9ddbe81d96a64eb4918d8d53dea45a4))

- Wallet screen retire money button fixed ([c330fb0](https://github.com/KeaKit/KeaKit/commit/c330fb043892c574338ac4dce93ee29e25df022f))

- Córdoba misspell and add missing service country to seeder ([d1f0c9f](https://github.com/KeaKit/KeaKit/commit/d1f0c9fc5de3aecded6992604b2ea1d40f9a86cf))

- Add country to Service and Article interfaces ([5a2bb20](https://github.com/KeaKit/KeaKit/commit/5a2bb20d95b2f1754371ca2999243c05af7c7772))

- Load country in article and service edit screens ([30f6ae2](https://github.com/KeaKit/KeaKit/commit/30f6ae245eaa321b9c51c7eb41012a3054acc78e))

- Add column annotations so character length validation isn't thrown ([c1ce7d1](https://github.com/KeaKit/KeaKit/commit/c1ce7d171c2f3396b36455457c71bd1c7548c9c2))

- Now a user can go back from notifications screen and the layout remains in both notifications screen ([9799fa1](https://github.com/KeaKit/KeaKit/commit/9799fa1982fd4e72add9efb927fe443e2a833a57))

- Minor issues ([da61925](https://github.com/KeaKit/KeaKit/commit/da61925570488add5def060323c2346776650158))

- Hide unavailable items from map selection ([e81c44d](https://github.com/KeaKit/KeaKit/commit/e81c44dfddc275dc569bc9f77663328b058e9162))

- Include rented articles in kit map availability ([987142e](https://github.com/KeaKit/KeaKit/commit/987142e138fe73c35a8e3d53dc727496087bf3ee))

- Service now show real availability ([491eacf](https://github.com/KeaKit/KeaKit/commit/491eacf3240b4317b6391b326508f5f5030c3a54))

- Service status is shown in Mis servicios ([e9cf048](https://github.com/KeaKit/KeaKit/commit/e9cf048f154ff558a3d8e79b553d1ded2734c5d4))

- Show owner commission promo badge ([7c30267](https://github.com/KeaKit/KeaKit/commit/7c3026754c181c1e13bd91146cc646e41069f750))

- Add kit delivery entities to kits in seeder ([1de276e](https://github.com/KeaKit/KeaKit/commit/1de276eaa184fff0a65db9a5045fd070b9ec1519))

- Now user cannot set as read already read notifications ([f215fd9](https://github.com/KeaKit/KeaKit/commit/f215fd983cc206db9779de89f5f26cb44371836b))

- All new tracking notifications are displayed now ([3b4fa3f](https://github.com/KeaKit/KeaKit/commit/3b4fa3fc5c60e7b18e28e838f74d65af9ecad9a3))

- Delete duplicated tracking notifications ([3cf4657](https://github.com/KeaKit/KeaKit/commit/3cf4657b1b81f225eb03bb63b884de8a7c10ab56))

- Only receive tracking notifications from courier and paid or active kits ([268eb61](https://github.com/KeaKit/KeaKit/commit/268eb61a0a1d87185f99f6c487e24ee94d08509a))

- Add missing tests ([10899b0](https://github.com/KeaKit/KeaKit/commit/10899b05d227cfe583a9265eb9ea1a78515b0c3c))

- Now you can check return once ([f52a07d](https://github.com/KeaKit/KeaKit/commit/f52a07d7bfe77d710e92b7f8b30b10ed87179be8))

- Solve test errors ([c8442e8](https://github.com/KeaKit/KeaKit/commit/c8442e8649e68e913b32482c453283a858dcc261))

- Now avaliable product filter works correctly ([c727201](https://github.com/KeaKit/KeaKit/commit/c7272015b867744eb78f0e0bdaa993b24db93fa0))

- Clean code ([6f94d7e](https://github.com/KeaKit/KeaKit/commit/6f94d7e60e6735ca38e3b6288e1ab12ed1394ee5))

- Refund valoration button fixed ([d26f94b](https://github.com/KeaKit/KeaKit/commit/d26f94bf24e074540d5d26f79af60bbb9acd5bec))

- Now the amount that you pay is the same that amount you can see in kitdetailscreen ([cc6a7f1](https://github.com/KeaKit/KeaKit/commit/cc6a7f121e16579828930e05ae83213738451e08))

- Now the guarantee is by  item not by kit ([03a1aa0](https://github.com/KeaKit/KeaKit/commit/03a1aa093c58a93e45de75ae88bf055efb659a42))

- Seeder macbook is now consistent ([c256da9](https://github.com/KeaKit/KeaKit/commit/c256da9edc434f03369b4675f01ee59e800df849))

- Changed messages in Kits, and language to Spanish ([725d08a](https://github.com/KeaKit/KeaKit/commit/725d08aa69b227d4f576d218533875c1b1195f9a))

- Map error when listing products ([d22818a](https://github.com/KeaKit/KeaKit/commit/d22818a07e4b355d13f6cacaaefb3bfebc58687e))

- Service now show real availability ([0ce9d7d](https://github.com/KeaKit/KeaKit/commit/0ce9d7d7a71267ef18878187a38d012ce0ba3962))

- Service status is shown in Mis servicios ([08ca189](https://github.com/KeaKit/KeaKit/commit/08ca18987d8457ce02ebf4a40cae1ddc020e2c4a))

- Show owner commission promo badge ([6763c6f](https://github.com/KeaKit/KeaKit/commit/6763c6f3f3b3febcbc1884b866137c1ab6392744))

- Real availabilty when creating kit ([7223192](https://github.com/KeaKit/KeaKit/commit/7223192351d4e79a8ade2d077fd80665997c670e))

- Available error when it isnt availaby in units ([8726cdd](https://github.com/KeaKit/KeaKit/commit/8726cddc130843b7420f5a0ca6abd4b124f56d72))

- Frontend tests ([29e2435](https://github.com/KeaKit/KeaKit/commit/29e24354455eb8001a5db92db1fb9103be307143))

- Demand alert to get dates ([781259a](https://github.com/KeaKit/KeaKit/commit/781259a2a4933ab320fa089dc19b8acaa1aa50e2))

- Available filter on creatingkit ([66ae4cc](https://github.com/KeaKit/KeaKit/commit/66ae4ccb397e1ba6cf9107ad3363a21d2e0a83b7))

- Api deleted urls ([d1deb00](https://github.com/KeaKit/KeaKit/commit/d1deb00b46df857a5e0093c7abaef2135e4cf22e))

- Coday upgrade ([5190a5c](https://github.com/KeaKit/KeaKit/commit/5190a5cf3a4f91c8f1be9d0ddf3e3a4f88b2aae3))

- Update total units service ([c652af1](https://github.com/KeaKit/KeaKit/commit/c652af14f502d3a8974d908549a3ba8ce6b3b285))

- Delete duplicated ItemCatalog type ([f533942](https://github.com/KeaKit/KeaKit/commit/f533942e48661673555ce9ee8bf39b6e6b1c1027))

- Delete unexisting and unused import at CreateKitScreen ([ce8ab23](https://github.com/KeaKit/KeaKit/commit/ce8ab23e510c10d281708ede9e952b7a62816c74))

- Change kit subtotal calculation so it shows its real price ([0dcc07b](https://github.com/KeaKit/KeaKit/commit/0dcc07b5dc68e85f182bebbe2d7fee9fa9291023))

- Apply discount to total price shown ([8d60a70](https://github.com/KeaKit/KeaKit/commit/8d60a701156473eb74f2462059e325c6ab446d76))

- Show original price and price with discount applied in MyKitsScreen ([f8fdb5e](https://github.com/KeaKit/KeaKit/commit/f8fdb5e17260a361c40084997042618310cc1f97))

- Fixed language inconsistency ([6c380de](https://github.com/KeaKit/KeaKit/commit/6c380de77a813b931c8e74a7c14acaabf132e491))

- Prevent future purchase dates ([6233277](https://github.com/KeaKit/KeaKit/commit/623327729e56c5a048a70a840538c3c2661de379))

- Know new kits are shown first ([66633b6](https://github.com/KeaKit/KeaKit/commit/66633b65ae5375f47b90991f0aecb5da3e19c639))

- Owner cant rent own articles in default kits ([a1bda1c](https://github.com/KeaKit/KeaKit/commit/a1bda1c4c01a6dbd34549e076b5fb44da4e411c4))

- Añadir error si usuario alquila kit predeterminado cuyos articulos le perteneces ([0b26e09](https://github.com/KeaKit/KeaKit/commit/0b26e09689c2455705087461dda951226a056469))

- Fix codacy error ([2be54d9](https://github.com/KeaKit/KeaKit/commit/2be54d9de27f6448f2c1973ad34485e063022b73))

- Truly fix codacy error ([b982858](https://github.com/KeaKit/KeaKit/commit/b9828587ec9cc5ed033305e218b8062e4bf9841a))

- Disponibilidad errónea tras evaluación prematura ([ecb757e](https://github.com/KeaKit/KeaKit/commit/ecb757eeab5002c27764e9776c71f1b5f27cc9b5))

- Added CRON job for closing kits automatically (not tested yet) ([77c39ff](https://github.com/KeaKit/KeaKit/commit/77c39ff9f9a1b9b430640b10a1e953e979ce75f2))

- Update Sprint Backlog title for Squad 4 to reflect correct sprint name ([8c66159](https://github.com/KeaKit/KeaKit/commit/8c66159210bf442b08faec599da56f31779d9551))

- Clean up PaymentServiceTest by removing unnecessary mocks and comments ([fdd5c19](https://github.com/KeaKit/KeaKit/commit/fdd5c191ff7713b498108bcf6f37dd734111f61c))

- Remove unnecessary comments in PaymentServiceTest ([3756b44](https://github.com/KeaKit/KeaKit/commit/3756b44cb13ceabd710fa1545bdb2d4ff2b7cfff))

- Fix message when kit is draft, should not appear "el pedido llegará x" ([7414c2c](https://github.com/KeaKit/KeaKit/commit/7414c2c1dadd27bcbf12b1a376aafcdaf423b468))

- Add every municipality in Spain to database seeder ([b1832c7](https://github.com/KeaKit/KeaKit/commit/b1832c7df05cd6b396cf86a3ee1bff815b20accc))

- Modify commission input so it scales correctly with screen width ([9c6cb34](https://github.com/KeaKit/KeaKit/commit/9c6cb349002da7526cfb9a468c72c05394cc3b76))

- Change add products button position in create default kit screen and make it scale with screen width ([49cb8bc](https://github.com/KeaKit/KeaKit/commit/49cb8bc7d9a2fa45d5c1b46bd6a97be825be2c57))

- Add a breakpoint that makes buttons display in columns or rows and make code input scale with screen width ([e68925f](https://github.com/KeaKit/KeaKit/commit/e68925fadac248f65a7e14b6e924d696bbe0645c))

- Correct Sevilla spelling ([a69fb46](https://github.com/KeaKit/KeaKit/commit/a69fb4635f2330dd07a016ec2433fa6ed88732b8))

- Tracking notifications no longer repeat ([d585809](https://github.com/KeaKit/KeaKit/commit/d585809e501477ba30618dfc041a809dfa83b6b5))

- Add navbar offset to everywhere its needed to avoid navbar overlapping ([ea28174](https://github.com/KeaKit/KeaKit/commit/ea28174b4ac8a7e570d4b52f83317e5e5dcd9237))

- Change category articles min column quantity to 2, so the list fits in mobile phone screens ([eea65d8](https://github.com/KeaKit/KeaKit/commit/eea65d81b218edf5106abdf41da8a951dd85c325))

- Change category prices inputs so they fit into a mobile phone screen ([856af6d](https://github.com/KeaKit/KeaKit/commit/856af6d165b37dbf4fd5c8727e16936bcae89007))

- Now, filter buttons are spread across more than one row when screen is narrow enough ([176d298](https://github.com/KeaKit/KeaKit/commit/176d298b236e9dd537cd7224f10a9decc5ef7266))

- Backend no longer allows creating draft kits without items ([4d50a7e](https://github.com/KeaKit/KeaKit/commit/4d50a7e3bb98a5f8e6ca182900ee7d2395cb7226))

- Email price breakdown fixed ([35d0f4d](https://github.com/KeaKit/KeaKit/commit/35d0f4dfc1e300c8d10f0c48603d4e99bf5b2a3f))

- Disable order kit if either city or country is null ([7275e4a](https://github.com/KeaKit/KeaKit/commit/7275e4ab5704e270a5ff583a8925c08cd2a6a534))

- Add validation to paying draft items ([67e729f](https://github.com/KeaKit/KeaKit/commit/67e729f57ea812c88b52a3eb751e41eaf59dd79e))

- Remove unavailable item from draft kit ([14d8c9b](https://github.com/KeaKit/KeaKit/commit/14d8c9bbc894624d30090e159714d8e67964721e))

- Find item by id when validating kit now uses the item id not its memento ([6c5ea9e](https://github.com/KeaKit/KeaKit/commit/6c5ea9e0777599ee678bf3f73e95033ea76d7cb5))

- Fix error message ([c7e568e](https://github.com/KeaKit/KeaKit/commit/c7e568e1ed47b6827232ef90876a3ea1b1c3f62d))

- Validate kit creation form before opening guarantee modal ([d8a3c92](https://github.com/KeaKit/KeaKit/commit/d8a3c920211156a90fa759ab2b4531cc804de411))

- Fix Codacy issues at CreateKitScreen ([4871037](https://github.com/KeaKit/KeaKit/commit/487103795236d0f94c0683a5ca4623b12be7d6a3))

- Add validation to renting draft kit with past dates ([f5364ef](https://github.com/KeaKit/KeaKit/commit/f5364ef81b319dcfa870fa2c076d423632f5dd86))

- Now the owner receives the money correctly when months are decimals ([1992ca6](https://github.com/KeaKit/KeaKit/commit/1992ca6da5b350b22b4261f82940aa8ea8a3cbac))

- Added a modal that advise the user that a commision will be taken from their articles or services rented ([68122d0](https://github.com/KeaKit/KeaKit/commit/68122d02005c48d017ea4d268ff6461c1bb58905))

- Add confirm modal showing after validation ([e926814](https://github.com/KeaKit/KeaKit/commit/e92681466ce3f0821afa675f39134216566c589b))

- Unify the visual style of the back arrow ([4b17702](https://github.com/KeaKit/KeaKit/commit/4b17702d8293596f0ea449c258e1ec8c8381315e))

- Test frontend ([b6a3d4a](https://github.com/KeaKit/KeaKit/commit/b6a3d4a7ac0839bdaca0ac3c2522057187a005e9))

- SEO Fix ([b7e6a59](https://github.com/KeaKit/KeaKit/commit/b7e6a592a15c6479e03791933dae7cb83e81f372))

- Changed some archives ([425c166](https://github.com/KeaKit/KeaKit/commit/425c1663607c7163d3cbe47e0a727cae428f9e33))

- Fixed cd to not redeploy and added security config for frontend ([80a1a3b](https://github.com/KeaKit/KeaKit/commit/80a1a3b9ef72ebf15bd652692107a98169e960ee))

- Added both firebase base url and custom domain to config ([dc6ca31](https://github.com/KeaKit/KeaKit/commit/dc6ca3159f800707c7c477cc8160458f26ac84ef))

- Added base url for the api ([e695fd1](https://github.com/KeaKit/KeaKit/commit/e695fd18ebc5063e4fa486f751345351029cf7fd))

- Changed back frontend test condition ([2e51236](https://github.com/KeaKit/KeaKit/commit/2e51236fd5721587eff2259f875c1258547b5e1b))

- Removed expo-router temporarily ([a34a978](https://github.com/KeaKit/KeaKit/commit/a34a9781a3e61a8c38b59baf6e9d1ee623db8e4e))

- Added temporal ci-cd action to resolve deploying issue ([ba5f906](https://github.com/KeaKit/KeaKit/commit/ba5f906d15e1f19813936011c0eeb647226a57a9))

- Fix hosting  robots.txt y sitemap.xml and update sitemap ([1b25cda](https://github.com/KeaKit/KeaKit/commit/1b25cdad1ea42085cfc791c5296a0c3ba1ea1ebb))

- Fixed (I hope) ([3fe717a](https://github.com/KeaKit/KeaKit/commit/3fe717a2373b6388e871c63eeb8601d3ba2cbcda))

- FIxed sitemap with the new project ([d60b31c](https://github.com/KeaKit/KeaKit/commit/d60b31c586efa7200d3ff34302ae65d29ee10310))

- Fix index html the good one, which uses the workflow ([9c27771](https://github.com/KeaKit/KeaKit/commit/9c27771d1c3d85c9b2f0820a09317f2745ff6ec2))

- Fixed index.html generated ([df2d17e](https://github.com/KeaKit/KeaKit/commit/df2d17ef20e7aeec78bec53d2cd7d5f76d1316bc))

- Fix url's app ([3d60734](https://github.com/KeaKit/KeaKit/commit/3d6073491130209485aa4cdf77e076f0bf7587aa))

- Fixed some bugs ([09ade00](https://github.com/KeaKit/KeaKit/commit/09ade00261780c2e680cb762dec0fcf783b92b3c))


### Docs


- Feedback doc created and meerkatteers and Nexus feedback added ([acfbc6c](https://github.com/KeaKit/KeaKit/commit/acfbc6cbc063024f8c92fe2597437a53fba9133b))


### Novedades


- Update feedback and failure conditions in documentation ([f26e6f2](https://github.com/KeaKit/KeaKit/commit/f26e6f2b2f54a37d939425d1d36335867a18541e))

- Add frontend logout force when token is expired ([7f1e057](https://github.com/KeaKit/KeaKit/commit/7f1e057a3a870b6074674fb9073d2c9ef782d00f))

- Add detailed profitability estimation, cost management, and pilot user benefit plan ([eedf222](https://github.com/KeaKit/KeaKit/commit/eedf2221527ffee6eb25a1e90489dbe736caba71))

- Add api and method in articleService.ts ([f7e72be](https://github.com/KeaKit/KeaKit/commit/f7e72be1f5d0d2d3039c8b887430d11a182eede5))

- Add ui ([31ea294](https://github.com/KeaKit/KeaKit/commit/31ea294bfc1398dff203e36bb96ed250f00a4dd0))

- Improve return process function ([785911c](https://github.com/KeaKit/KeaKit/commit/785911c6ce0fd82934c795d5bd79101a5469f62c))

- Add validation to prevent 0% discount on promotional codes ([fdc924b](https://github.com/KeaKit/KeaKit/commit/fdc924b2e63def53fe298622c2e3f75faaf7d0d1))

- Cu arrendatario 10 tests ([9c9c09d](https://github.com/KeaKit/KeaKit/commit/9c9c09dc7e696795bdf58010833aa1399cc558d3))

- New edge cases tests ([14b72bc](https://github.com/KeaKit/KeaKit/commit/14b72bc873e6a4353e37e5a6adbf63671d877ecc))

- Notification on not avaliable item ([738b012](https://github.com/KeaKit/KeaKit/commit/738b01231f888fdba331d1539f9419d95cbfb5ff))

- Notification on services too ([976903c](https://github.com/KeaKit/KeaKit/commit/976903c9bdca4de9f7e9243bd8cbd7c08e2e617e))

- Notification title depending on the notification ([78fcd5c](https://github.com/KeaKit/KeaKit/commit/78fcd5cb666d05a4f50c2a583b732dfe56a65cdb))

- Codacy static code ijmprovement ([f4df2b8](https://github.com/KeaKit/KeaKit/commit/f4df2b8fe250116b7d7775ecf2b40d8481e59be8))

- Demand alert on services ([98245d1](https://github.com/KeaKit/KeaKit/commit/98245d1c6f272c9596e2e2ca06d4a8208155de45))

- Test on demand alert service ([d6a97db](https://github.com/KeaKit/KeaKit/commit/d6a97db457bff221ce5225f758086ea43ebcce89))

- Alertas en fechas fuera de rango ([aa9eedc](https://github.com/KeaKit/KeaKit/commit/aa9eedc273bbea1de1b5a0b98d066bc01623aacc))

- Persist discount rate in kit entity ([5c35e27](https://github.com/KeaKit/KeaKit/commit/5c35e270cf5e52c8f8301d3666d071cf71956db9))

- Add script for the investor announcement ([4b67318](https://github.com/KeaKit/KeaKit/commit/4b6731805b7eeb47a40e022654a358c17d854462))

- Automatically create incident when an item isn't what it is supposed to be ([9ae88ff](https://github.com/KeaKit/KeaKit/commit/9ae88ff8ab3c3fde93bb1a15e53e85998ffb67d5))

- Refactor every modal to look the same and improve it ([51d6cd9](https://github.com/KeaKit/KeaKit/commit/51d6cd9db3f8e430f555d17f16ddd300bcc26de1))

- Automatically create an incident to an item that is not what expected ([036a263](https://github.com/KeaKit/KeaKit/commit/036a263a2280bba9a7a732af8867af4f44adaf75))

- Add PPL backlog for Squad 4 ([6b8f2e1](https://github.com/KeaKit/KeaKit/commit/6b8f2e19f68b38a3c724e675c0f774c6cc311bb8))

- Add transaction details feature ([563ae5f](https://github.com/KeaKit/KeaKit/commit/563ae5f027daefb79804f2411bf60e7b56126fa9))

- Add a hook to calculate navbar offset ([be1ba05](https://github.com/KeaKit/KeaKit/commit/be1ba054a9b686da185a41cb5899f96f3eb8d303))

- Add contributions report for Preparing Project Launch ([e7101d8](https://github.com/KeaKit/KeaKit/commit/e7101d8951f29b134283117cc93bafb6768fe048))

- Added descriptions with meta labels in screens: Home, Admin, Article, Category... ([67d3779](https://github.com/KeaKit/KeaKit/commit/67d377918deaa695fc30bbe15bef91eb179981c6))

- Added meta names to all screens ([d06bab2](https://github.com/KeaKit/KeaKit/commit/d06bab2e2fb6a18f62540ad790d065520afb7cd6))


### Refactorizaciones


- Add ApiError type to manage different http status and data validation when backend throws exceptions ([54225d3](https://github.com/KeaKit/KeaKit/commit/54225d3fc8de59210736ed7b0b85eef83632c737))

- Move bad indented code ([a295dd9](https://github.com/KeaKit/KeaKit/commit/a295dd9699f3ffd80c3f71d67f5b60b04427631f))

- Change de view of articles and services while create or pay a kit ([27e1952](https://github.com/KeaKit/KeaKit/commit/27e1952e6dd228f4ff9e77960986e6b683015543))

- Clean CreateKitScreen and ProductSelectionModal ([edaeaf0](https://github.com/KeaKit/KeaKit/commit/edaeaf0bc3f02937f186e85825c4b75208f33ace))

- Change description in Home and WIthdraw screens ([047cf67](https://github.com/KeaKit/KeaKit/commit/047cf67cafe9f8a1a4b3024a6cd2b6134f04f418))


### doc


- Update document version ([75ef55d](https://github.com/KeaKit/KeaKit/commit/75ef55d439bc9f2f123a36f18a1c7d6d95d9879d))

- Update document with nexus use cases ([584d247](https://github.com/KeaKit/KeaKit/commit/584d2478170e9b3547e9a26e452cfc67e89dec19))

- Update document ([f01bb18](https://github.com/KeaKit/KeaKit/commit/f01bb1831e9802a3f0f2731fd8bc0d7153aa5625))

- Update document ([2884f04](https://github.com/KeaKit/KeaKit/commit/2884f040668c40121c88aab66e9c3da1a65a310c))

- Update document ([cc8141c](https://github.com/KeaKit/KeaKit/commit/cc8141c0820c01a7ecb186bc89e44a88789fb875))


### style


- LowerCase to UpperCase, better visualization in home screen ([f214cd4](https://github.com/KeaKit/KeaKit/commit/f214cd432a63fd313a48fefbd171f3d768c995f7))

- Add spaces ([651fc6c](https://github.com/KeaKit/KeaKit/commit/651fc6cb5b4bea651cf1bd2203f5d9b29e46b2c3))


### test


- Fix article return service tests ([804a30e](https://github.com/KeaKit/KeaKit/commit/804a30e501299fbba318706847953dac3aff82d4))

- Updated incident tests ([28d2cbc](https://github.com/KeaKit/KeaKit/commit/28d2cbc33d266df079a97a875b9133d573aebf8b))

- Add AdminPromoCode controller tests for the creation and update functionalities ([3e2497d](https://github.com/KeaKit/KeaKit/commit/3e2497de279900368edbe8a65362cbe34d5bf597))

- Add controller get promo code tests ([753e3c0](https://github.com/KeaKit/KeaKit/commit/753e3c0b2fb2a63cb46f0af9cca41523075e68b1))

- Fix failing tests ([6febe28](https://github.com/KeaKit/KeaKit/commit/6febe28847cef90bcb6dcc4c6dc5ea059baeae2b))

- Fix failing tests ([c9b1276](https://github.com/KeaKit/KeaKit/commit/c9b12764d3be34115b9eabf93b4adc9ef0503991))

- :white_check_mark: email test updated ([9ddef3b](https://github.com/KeaKit/KeaKit/commit/9ddef3b950d3f6a2c02e304123d191e83cb64810))

- Add missing tests to validate kit ([c7e96d7](https://github.com/KeaKit/KeaKit/commit/c7e96d705ad13419087f1ff564d5d235d9f06800))

- Fix failing tests ([b658586](https://github.com/KeaKit/KeaKit/commit/b6585867589dd477452f7142d35ba2ad9f1639d1))


### tests


- Type fetch mocks without any ([f9b9ea8](https://github.com/KeaKit/KeaKit/commit/f9b9ea8176cc3a2a3d23fea4b11087474b2e8512))

- Codacy feedback ([d97f6bd](https://github.com/KeaKit/KeaKit/commit/d97f6bddc84823504df59451b2f44a97d57473ad))


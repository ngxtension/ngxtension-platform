

## [1.9.5](https://github.com/nartc/ngxtension-platform/compare/1.9.4...1.9.5) (2024-01-11)


### Bug Fixes

* **plugin:** get all projects if project nor path is passed in ([34293d1](https://github.com/nartc/ngxtension-platform/commit/34293d12a14e494acb7b4f2cd198dc95bfb5261c))

## [1.9.4](https://github.com/nartc/ngxtension-platform/compare/1.9.3...1.9.4) (2024-01-11)


### Bug Fixes

* **plugin:** ensure to track withTransforms regardless of typenode exists or not ([b512f1f](https://github.com/nartc/ngxtension-platform/commit/b512f1f45118f54417dc4f25905ca5c8769f0ddf))

## [1.9.3](https://github.com/nartc/ngxtension-platform/compare/1.9.2...1.9.3) (2024-01-11)


### Bug Fixes

* **plugin:** make sure all classes in a file is processed ([4a687a5](https://github.com/nartc/ngxtension-platform/commit/4a687a5526cc189f93965a6608df5ae43b6c0a9d))

## [1.9.2](https://github.com/nartc/ngxtension-platform/compare/1.9.1...1.9.2) (2024-01-11)


### Bug Fixes

* **plugin:** use correct property name for file path ([a24d995](https://github.com/nartc/ngxtension-platform/commit/a24d99578fb08add11ad1b9cbfabea030603a440))

## [1.9.1](https://github.com/nartc/ngxtension-platform/compare/1.9.0...1.9.1) (2024-01-11)


### Bug Fixes

* **plugin:** add ts-morph to dep of ngxtension ([a78fdae](https://github.com/nartc/ngxtension-platform/commit/a78fdae158a4e38ca544138bed07d2a98a8293f9))

## [1.9.0](https://github.com/nartc/ngxtension-platform/compare/1.8.1...1.9.0) (2024-01-11)


### Features

* **create-injection-token:** add createService ([#222](https://github.com/nartc/ngxtension-platform/issues/222)) ([294c66a](https://github.com/nartc/ngxtension-platform/commit/294c66a8668774be8fe4be8a43f76fda7789db6f))
* **NgxSvgSprite:** add a directive for rendering symbols of svg sprites ([#219](https://github.com/nartc/ngxtension-platform/issues/219)) ([c585aca](https://github.com/nartc/ngxtension-platform/commit/c585aca16e2badb3261d2ee8243a651d8d6a3787))
* **plugin:** generator to convert to signal inputs ([39bd37e](https://github.com/nartc/ngxtension-platform/commit/39bd37eed331ea489b5d406f8546b5289d505f8d))


### Refactor

* **NgxControlError:** improve statematcher ([#220](https://github.com/nartc/ngxtension-platform/issues/220)) ([9507c07](https://github.com/nartc/ngxtension-platform/commit/9507c070b591efbc32b8225044c6afe7777b22b8))

## [1.8.1](https://github.com/nartc/ngxtension-platform/compare/1.8.0...1.8.1) (2024-01-06)


### Bug Fixes

* **create-signal:** change signal-value to create-signal ([08aa14f](https://github.com/nartc/ngxtension-platform/commit/08aa14f40e105c9b5649e320244c035819609dd3))


### Documentations

* add gzip size badge ([5432502](https://github.com/nartc/ngxtension-platform/commit/5432502281c16cf6726ab3a6c0e7592f66eb0ed1))

## [1.8.0](https://github.com/nartc/ngxtension-platform/compare/1.7.0...1.8.0) (2024-01-06)


### Features

* add createSignal and createComputed helper functions ([#216](https://github.com/nartc/ngxtension-platform/issues/216)) ([a852fb5](https://github.com/nartc/ngxtension-platform/commit/a852fb5333b0857275e943fc2a101a17760d2d4e))
* **NgxControlError:** add NgxControlError directive to form utils ([#212](https://github.com/nartc/ngxtension-platform/issues/212)) ([28af6cc](https://github.com/nartc/ngxtension-platform/commit/28af6cc5a75a85b7b27d146bf2d114ccba67413e))


### Bug Fixes

* **create-signal:** add index ([53b22de](https://github.com/nartc/ngxtension-platform/commit/53b22de567f57202ba5eace7a9bd83f2e3432b0d))
* **signal-slice:** prevent early inference in selector typing ([#214](https://github.com/nartc/ngxtension-platform/issues/214)) ([2d3a216](https://github.com/nartc/ngxtension-platform/commit/2d3a216e84ea1a45cf597978c0ef4a973fa9f700))


### Documentations

* add RobbyRabbitman as a contributor for code ([#217](https://github.com/nartc/ngxtension-platform/issues/217)) ([8a53717](https://github.com/nartc/ngxtension-platform/commit/8a537179624da2001b6f33c667cdb393d7f40b3c))

## [1.7.0](https://github.com/nartc/ngxtension-platform/compare/1.6.2...1.7.0) (2023-12-27)


### Features

* connect two signals with each other ([#209](https://github.com/nartc/ngxtension-platform/issues/209)) ([be0edcc](https://github.com/nartc/ngxtension-platform/commit/be0edcc47c13ddb4fe572d4c78e18c37e1ae845e))


### Documentations

* renamed documentVisibilityState to injectDocumentVisibility ([#211](https://github.com/nartc/ngxtension-platform/issues/211)) ([230cf4b](https://github.com/nartc/ngxtension-platform/commit/230cf4b1cdfe88e6ba3b02df0153ca5db6ca7ca4)), closes [#210](https://github.com/nartc/ngxtension-platform/issues/210)
* third arg is the options-obj for computedFrom ([#210](https://github.com/nartc/ngxtension-platform/issues/210)) ([344c3fe](https://github.com/nartc/ngxtension-platform/commit/344c3fe043087bb2d29995d4a301cb59a4de69a2))

## [1.6.2](https://github.com/nartc/ngxtension-platform/compare/1.6.1...1.6.2) (2023-12-14)


### Bug Fixes

* **host-binding:** allows attributes to be removed with nullish value… ([#205](https://github.com/nartc/ngxtension-platform/issues/205)) ([9b8639b](https://github.com/nartc/ngxtension-platform/commit/9b8639b96fe2ed3dba72e86b9caa13b8051a2c2e))


### Documentations

* add geometricpanda as a contributor for code ([#206](https://github.com/nartc/ngxtension-platform/issues/206)) ([65a1c10](https://github.com/nartc/ngxtension-platform/commit/65a1c10ddd1c161077b480010563fa80867f5322))

## [1.6.1](https://github.com/nartc/ngxtension-platform/compare/1.6.0...1.6.1) (2023-12-11)


### Bug Fixes

* **signal-slice:** add apply trap to proxy for loading lazySources when signal value accessed directly ([#200](https://github.com/nartc/ngxtension-platform/issues/200)) ([fa68a8d](https://github.com/nartc/ngxtension-platform/commit/fa68a8d49607a3acbbe4d3c7354f2325e9bbe2c7))
* typos ([#198](https://github.com/nartc/ngxtension-platform/issues/198)) ([039eefb](https://github.com/nartc/ngxtension-platform/commit/039eefbda5fc5a71fc1e3c3e72c71d362b5024fc))


### Documentations

* add rlmestre as a contributor for doc ([#201](https://github.com/nartc/ngxtension-platform/issues/201)) ([f2fdc7b](https://github.com/nartc/ngxtension-platform/commit/f2fdc7b15f021267abb70a9baf8cab8647aeaef6))
* Add Spanish translations to Injector/Intl doc pages ([#199](https://github.com/nartc/ngxtension-platform/issues/199)) ([a2e33ef](https://github.com/nartc/ngxtension-platform/commit/a2e33ef4a936ae8eb5f95195fc2201381f55a7ad))
* add swami-sanapathi as a contributor for doc ([#202](https://github.com/nartc/ngxtension-platform/issues/202)) ([29d5503](https://github.com/nartc/ngxtension-platform/commit/29d550356d3d2bb6fbc5e9c8f3b678c865f4ec9f))

## [1.6.0](https://github.com/nartc/ngxtension-platform/compare/1.5.0...1.6.0) (2023-12-10)


### Features

* **signal-slice:** add lazySources ([#197](https://github.com/nartc/ngxtension-platform/issues/197)) ([44cf5f9](https://github.com/nartc/ngxtension-platform/commit/44cf5f955c7045f39ca57ad23c2f1c2a3b9834c6))


### Documentations

* add justinrassier as a contributor for doc ([#195](https://github.com/nartc/ngxtension-platform/issues/195)) ([7aa768d](https://github.com/nartc/ngxtension-platform/commit/7aa768d61dd6b21b7f6421ce3f8e1e949aec3937))
* update readme to point to angular.dev ([#193](https://github.com/nartc/ngxtension-platform/issues/193)) ([4e670c0](https://github.com/nartc/ngxtension-platform/commit/4e670c08610d21690bca9c90961cecddbd1b7097))

## [1.5.0](https://github.com/nartc/ngxtension-platform/compare/1.4.0...1.5.0) (2023-12-06)


### Features

* add collection for contributors ([#174](https://github.com/nartc/ngxtension-platform/issues/174)) ([d8b7936](https://github.com/nartc/ngxtension-platform/commit/d8b7936f294105634c37f1cc4a3e7f9477aa2f91))
* add contributors and badge to doc pages ([#170](https://github.com/nartc/ngxtension-platform/issues/170)) ([06b86a9](https://github.com/nartc/ngxtension-platform/commit/06b86a998fdf1b7c12d109cc709e0abbb0364494))
* add contributors and badge to doc pages ([#173](https://github.com/nartc/ngxtension-platform/issues/173)) ([b468031](https://github.com/nartc/ngxtension-platform/commit/b4680317f74b264cd30485a04e9fc9d39cd440c4))
* added computedPrevious helper fn ([#181](https://github.com/nartc/ngxtension-platform/issues/181)) ([96d5de4](https://github.com/nartc/ngxtension-platform/commit/96d5de4233195ad726da364706bdd73c63a34208))
* added injectDocumentVisibility utility ([f6b5e77](https://github.com/nartc/ngxtension-platform/commit/f6b5e770c4257288924956e0a1f37fe2d4fddadc))
* **docs:** add internationalization to docs ([#191](https://github.com/nartc/ngxtension-platform/issues/191)) ([cbfbe85](https://github.com/nartc/ngxtension-platform/commit/cbfbe854520a8a4e93fbe0fb7dfb5495ca2ddcf7))
* ported injectNetwork() to Angular ([#186](https://github.com/nartc/ngxtension-platform/issues/186)) ([684a33a](https://github.com/nartc/ngxtension-platform/commit/684a33ae23332a8f55c7bdf567c4cc63c94b92c5))
* **signal-slice:** add actionEffects config ([#154](https://github.com/nartc/ngxtension-platform/issues/154)) ([9034032](https://github.com/nartc/ngxtension-platform/commit/9034032d021d16babfd88ad2670fd1842430f58b))


### Bug Fixes

* contributors ([e9f8c93](https://github.com/nartc/ngxtension-platform/commit/e9f8c939c5d02bde463e82c1d52210f1b932d458))
* **signal-slice:** Do not allow optional properties in signalSlice ([#177](https://github.com/nartc/ngxtension-platform/issues/177)) ([84ccf3c](https://github.com/nartc/ngxtension-platform/commit/84ccf3c917112b652d4b6bafd4ac04c792776a56))
* **signal-slice:** typing for Subject with union type ([#169](https://github.com/nartc/ngxtension-platform/issues/169)) ([746c0fc](https://github.com/nartc/ngxtension-platform/commit/746c0fc1fd15ad81a0b6895904ba371be5ddec0b))


### Documentations

* add ajitzero as a contributor for doc ([#172](https://github.com/nartc/ngxtension-platform/issues/172)) ([1b1efe2](https://github.com/nartc/ngxtension-platform/commit/1b1efe2955669f30e630d1eaad9930d76319c950))
* add fiorelozere as a contributor for code ([#185](https://github.com/nartc/ngxtension-platform/issues/185)) ([0275c02](https://github.com/nartc/ngxtension-platform/commit/0275c02bf94a3bdfc3c8b4750bf84dd7452d6d1a))
* add nelsongutidev as a contributor for doc ([#192](https://github.com/nartc/ngxtension-platform/issues/192)) ([437aa2c](https://github.com/nartc/ngxtension-platform/commit/437aa2c4eb42142b5f015f013727fb9b0c9b5529))
* add palexcast as a contributor for code ([#182](https://github.com/nartc/ngxtension-platform/issues/182)) ([776f593](https://github.com/nartc/ngxtension-platform/commit/776f593a38a9e845c1fa760a9f5e61cc1a857cdb))
* add robbaman as a contributor for code ([#189](https://github.com/nartc/ngxtension-platform/issues/189)) ([7feab72](https://github.com/nartc/ngxtension-platform/commit/7feab72f72a004cf5dfc3d74d43281883621b017))
* add toLazySignal() documentation ([#168](https://github.com/nartc/ngxtension-platform/issues/168)) ([e4ffaee](https://github.com/nartc/ngxtension-platform/commit/e4ffaee9d68d7ea5b11019cf969cd0d391de641d))
* fix docs ([8303cb0](https://github.com/nartc/ngxtension-platform/commit/8303cb0bcbea53974da915bf03e15b18172cefb8))

## [1.4.0](https://github.com/nartc/ngxtension-platform/compare/1.3.0...1.4.0) (2023-11-21)


### Features

* add toLazySignal() ([#166](https://github.com/nartc/ngxtension-platform/issues/166)) ([3659fbe](https://github.com/nartc/ngxtension-platform/commit/3659fbe66965503e41655083281d6995461c13da))
* **signal-slice:** allow supplying external subjects as reducers ([#152](https://github.com/nartc/ngxtension-platform/issues/152)) ([7df93d3](https://github.com/nartc/ngxtension-platform/commit/7df93d303cb24022dfb25602163ec46d9a4a2972))


### Bug Fixes

* **create-injection-token:** better decide when to use factory or provided value ([#161](https://github.com/nartc/ngxtension-platform/issues/161)) ([#162](https://github.com/nartc/ngxtension-platform/issues/162)) ([61d496d](https://github.com/nartc/ngxtension-platform/commit/61d496d06bae3ed678591f8013a828b5404d02ff))


### Documentations

* add diegovilar as a contributor for code ([#164](https://github.com/nartc/ngxtension-platform/issues/164)) ([c81fc22](https://github.com/nartc/ngxtension-platform/commit/c81fc221a031a7bb03a66da05f8a1deef0eb99aa))
* add e-oz as a contributor for code ([#167](https://github.com/nartc/ngxtension-platform/issues/167)) ([21e2cd2](https://github.com/nartc/ngxtension-platform/commit/21e2cd2b6707cfc216d3d94a102e7816bcbaed7d))
* add gianmarcogiummarra as a contributor for doc ([#165](https://github.com/nartc/ngxtension-platform/issues/165)) ([87d6ea4](https://github.com/nartc/ngxtension-platform/commit/87d6ea44122552d9855c77530f7e5139fad6fc54))
* fix allcontributors file ([9cae021](https://github.com/nartc/ngxtension-platform/commit/9cae021c609604f255eec23c1ec888599df08914))
* fix computedFrom example with injector ([#160](https://github.com/nartc/ngxtension-platform/issues/160)) ([2b6b5b9](https://github.com/nartc/ngxtension-platform/commit/2b6b5b9c93c98b45c1ae51bfaf9efe499f16ceb9))
* update starlight ([2b8405b](https://github.com/nartc/ngxtension-platform/commit/2b8405bb3b0512eb718ffbe2450f582b4e568937))


### Refactor

* **signal-slice:** remove reducers, rename asyncReducers to actionSources ([#158](https://github.com/nartc/ngxtension-platform/issues/158)) ([6a883c1](https://github.com/nartc/ngxtension-platform/commit/6a883c12d61eb9fabcb87bfa9743768249d8e879))

## [1.3.0](https://github.com/nartc/ngxtension-platform/compare/1.2.2...1.3.0) (2023-11-15)


### Features

* add 404 page ([#147](https://github.com/nartc/ngxtension-platform/issues/147)) ([64be3c1](https://github.com/nartc/ngxtension-platform/commit/64be3c1958106580d3a900529afa47e8f80f98b6))
* added inject params and inject query params ([16ef4e1](https://github.com/nartc/ngxtension-platform/commit/16ef4e117d8e7f69ae0bcb8f443b206574f78769))


### Bug Fixes

* add assertInInjectionContext ([a3d1a60](https://github.com/nartc/ngxtension-platform/commit/a3d1a60b49b228479899b8ccc9c1464926a9e9ac))
* better code health ([9f03d06](https://github.com/nartc/ngxtension-platform/commit/9f03d06a637e6f17ff6d96a3d71b9007f7e2f884))
* export utils ([11453a5](https://github.com/nartc/ngxtension-platform/commit/11453a55391b3ea8c954e6a2c116521b10bc184e))
* replace startWith with initial value ([99fad4f](https://github.com/nartc/ngxtension-platform/commit/99fad4f56ba3dc8701d192f719b5894b0b829c69))

## [1.2.2](https://github.com/nartc/ngxtension-platform/compare/1.2.1...1.2.2) (2023-11-14)


### Bug Fixes

* **signal-slice:** add undocumented (intentional) way to wait for state update from invoking reducers ([5370778](https://github.com/nartc/ngxtension-platform/commit/53707784558e0889eaec02fef590505083fbfe6a))

## [1.2.1](https://github.com/nartc/ngxtension-platform/compare/1.2.0...1.2.1) (2023-11-14)


### Bug Fixes

* **signal-slice:** extra selectors type ([bdfe10b](https://github.com/nartc/ngxtension-platform/commit/bdfe10bfda1f740558b684088a5b3e57124e6334))

## [1.2.0](https://github.com/nartc/ngxtension-platform/compare/1.1.1...1.2.0) (2023-11-13)


### Features

* **signal-slice:** allow supplying source as a function that accepts state signal ([#146](https://github.com/nartc/ngxtension-platform/issues/146)) ([051443b](https://github.com/nartc/ngxtension-platform/commit/051443b8155137b7101fe138efa185a200ea4538))

## [1.1.1](https://github.com/nartc/ngxtension-platform/compare/1.1.0...1.1.1) (2023-11-13)


### Bug Fixes

* peer dep range ([961de58](https://github.com/nartc/ngxtension-platform/commit/961de58a239bf666fbb3fc0be0becc8a79c1a5c5))

## [1.1.0](https://github.com/nartc/ngxtension-platform/compare/0.16.0...1.1.0) (2023-11-13)


### Features

* **signal-slice:** add asyncReducers ([#144](https://github.com/nartc/ngxtension-platform/issues/144)) ([3057f8b](https://github.com/nartc/ngxtension-platform/commit/3057f8b29ead06b2fc123bef1666b7f31d927116))


### Bug Fixes

* bump peer deps ([2179b8e](https://github.com/nartc/ngxtension-platform/commit/2179b8e60b98d4116e6788174a3409dc43f67485))

## [1.0.1](https://github.com/nartc/ngxtension-platform/compare/0.16.0...1.0.1) (2023-11-10)


### Bug Fixes

* bump peer deps ([2179b8e](https://github.com/nartc/ngxtension-platform/commit/2179b8e60b98d4116e6788174a3409dc43f67485))

## [1.0.0](https://github.com/nartc/ngxtension-platform/compare/0.16.0...1.0.0) (2023-11-09)

## [0.16.0](https://github.com/nartc/ngxtension-platform/compare/0.15.1...0.16.0) (2023-11-09)


### Features

* **signal-slice:** add effects config ([#141](https://github.com/nartc/ngxtension-platform/issues/141)) ([5b01712](https://github.com/nartc/ngxtension-platform/commit/5b01712ed173f1ce4a778877ea10fe9e9aad5943))


### Documentations

* add JeevanMahesha as a contributor for doc ([#142](https://github.com/nartc/ngxtension-platform/issues/142)) ([1cefa50](https://github.com/nartc/ngxtension-platform/commit/1cefa50b799a4b7d2e1b1246bf3fbe8a2dc1e931))
* added the logo ([#140](https://github.com/nartc/ngxtension-platform/issues/140)) ([dbd94d7](https://github.com/nartc/ngxtension-platform/commit/dbd94d716cc9952ec5bb22a3ed301fb776b185ed))

## [0.15.1](https://github.com/nartc/ngxtension-platform/compare/0.15.0...0.15.1) (2023-11-08)

## [0.15.0](https://github.com/nartc/ngxtension-platform/compare/0.14.1...0.15.0) (2023-11-08)


### Features

* **signal-slice:** add signalSlice ([#135](https://github.com/nartc/ngxtension-platform/issues/135)) ([76fcfad](https://github.com/nartc/ngxtension-platform/commit/76fcfad5b971aa076b3ab2480c751c5e69fddbc9))


### Bug Fixes

* **computedFrom:** add initialValue + throw Error in case of not sync emit ([#122](https://github.com/nartc/ngxtension-platform/issues/122)) ([285aa59](https://github.com/nartc/ngxtension-platform/commit/285aa598b99598eb07d7b237f39711c89f969b12))


### Documentations

* add joshuamorony as a contributor for code ([#136](https://github.com/nartc/ngxtension-platform/issues/136)) ([c89fe85](https://github.com/nartc/ngxtension-platform/commit/c89fe859e63c0b3cab3de6e8e900067deeb071b7))
* **computed:** fix typo in docs ([3cc8aa6](https://github.com/nartc/ngxtension-platform/commit/3cc8aa6f887109288266c39cf64a34e18071e347))
* **create-injection-token:** add extraProviders use-case with ngrx ([b17ae1d](https://github.com/nartc/ngxtension-platform/commit/b17ae1d805b8febe03778d6fa2c3c588ea6e093c))
* fix link ([8f5294f](https://github.com/nartc/ngxtension-platform/commit/8f5294fe2b34bc3b78de9c2f15d7f88ab3c97e87))
* update .all-contributorsrc ([5c8c9a0](https://github.com/nartc/ngxtension-platform/commit/5c8c9a0970341d8dda87a1a51965baf860116ee0))
* update README.md ([552d3df](https://github.com/nartc/ngxtension-platform/commit/552d3df9f6ed9cb9952a278d9bb3175886d22749))

## [0.14.1](https://github.com/nartc/ngxtension-platform/compare/0.14.0...0.14.1) (2023-10-29)


### Bug Fixes

* **computed:** use raw value instead of signal to track current value ([03aa1a6](https://github.com/nartc/ngxtension-platform/commit/03aa1a65c11cab5f28c3afc52169b194fbeb18ab))

## [0.14.0](https://github.com/nartc/ngxtension-platform/compare/0.12.0...0.14.0) (2023-10-29)


### Features

* **auto-effect:** add `injectAutoEffect` ([765400a](https://github.com/nartc/ngxtension-platform/commit/765400a600502b270c329362070d3a363bd489cd))
* **computed:** add computed/extendedComputed with access to previous computed value ([7260727](https://github.com/nartc/ngxtension-platform/commit/72607272199e1063a51261f84beed1bb69e8f932))


### Documentations

* add explanation for ConnectedSignal usage ([#128](https://github.com/nartc/ngxtension-platform/issues/128)) ([0fd95e7](https://github.com/nartc/ngxtension-platform/commit/0fd95e73a6253b328c2a63031849863a2c20f5ee))
* add joshuamorony as a contributor for doc ([#129](https://github.com/nartc/ngxtension-platform/issues/129)) ([1e8fa4f](https://github.com/nartc/ngxtension-platform/commit/1e8fa4f4532c69d49855f870aa2e3999be1730f5))
* fix documentation link in README ([#132](https://github.com/nartc/ngxtension-platform/issues/132)) ([00fb9c7](https://github.com/nartc/ngxtension-platform/commit/00fb9c7ab36e4b0030b5665d84e150eea0edab9b))

## [0.13.0](https://github.com/nartc/ngxtension-platform/compare/0.12.0...0.13.0) (2023-10-28)


### Features

* **auto-effect:** add `injectAutoEffect` ([765400a](https://github.com/nartc/ngxtension-platform/commit/765400a600502b270c329362070d3a363bd489cd))


### Documentations

* add explanation for ConnectedSignal usage ([#128](https://github.com/nartc/ngxtension-platform/issues/128)) ([0fd95e7](https://github.com/nartc/ngxtension-platform/commit/0fd95e73a6253b328c2a63031849863a2c20f5ee))
* add joshuamorony as a contributor for doc ([#129](https://github.com/nartc/ngxtension-platform/issues/129)) ([1e8fa4f](https://github.com/nartc/ngxtension-platform/commit/1e8fa4f4532c69d49855f870aa2e3999be1730f5))

## [0.12.0](https://github.com/nartc/ngxtension-platform/compare/0.11.1...0.12.0) (2023-10-24)


### Features

* **connect:** add ConnectedSignal usage ([4b25c55](https://github.com/nartc/ngxtension-platform/commit/4b25c557263f5332c22662cf8a304ee069806c30))

## [0.11.1](https://github.com/nartc/ngxtension-platform/compare/0.11.0...0.11.1) (2023-10-23)

## [0.11.0](https://github.com/nartc/ngxtension-platform/compare/0.10.0...0.11.0) (2023-10-23)


### Features

* **gestures:** finish all gestures ([263ed60](https://github.com/nartc/ngxtension-platform/commit/263ed60cc8e1b4e514704c1608450b44087b0cae))


### Documentations

* add trackBy hint to repeat util ([#123](https://github.com/nartc/ngxtension-platform/issues/123)) ([e12bdad](https://github.com/nartc/ngxtension-platform/commit/e12bdad43dbadc2ee6435a5449f9acd086c05db9))
* add vneogi199 as a contributor for test ([#124](https://github.com/nartc/ngxtension-platform/issues/124)) ([57f68b8](https://github.com/nartc/ngxtension-platform/commit/57f68b814069b83f3dc3e9f8d20a816a31a33ebc))

## [0.10.0](https://github.com/nartc/ngxtension-platform/compare/0.9.3...0.10.0) (2023-10-21)


### Features

* add click outside directive ([#117](https://github.com/nartc/ngxtension-platform/issues/117)) ([f187eed](https://github.com/nartc/ngxtension-platform/commit/f187eed5bf688efd1f88604b7723609c1bac576a))


### Documentations

* add dalenguyen as a contributor for code ([#120](https://github.com/nartc/ngxtension-platform/issues/120)) ([ee8b1c1](https://github.com/nartc/ngxtension-platform/commit/ee8b1c1f608599d45017b2f07fec2e73dd4b6349))

## [0.9.3](https://github.com/nartc/ngxtension-platform/compare/0.9.2...0.9.3) (2023-10-20)


### Bug Fixes

* **create-injection-token:** fix return type for initializer provider ([7387575](https://github.com/nartc/ngxtension-platform/commit/7387575ad708d7932b1b3d728effd4b788c6ae60))

## [0.9.2](https://github.com/nartc/ngxtension-platform/compare/0.9.1...0.9.2) (2023-10-20)

## [0.9.1](https://github.com/nartc/ngxtension-platform/compare/0.9.0...0.9.1) (2023-10-20)

## [0.9.0](https://github.com/nartc/ngxtension-platform/compare/0.8.0...0.9.0) (2023-10-20)


### Features

* **connect:** allow connect to a slice of an object signal ([bd59c51](https://github.com/nartc/ngxtension-platform/commit/bd59c515dc0c07ff9fb0f2148b6840b70b92db8b))

## [0.8.0](https://github.com/nartc/ngxtension-platform/compare/0.7.2...0.8.0) (2023-10-20)


### Features

* **create-injection-token:** expose initializer provider function for root tokens ([b8e9ccf](https://github.com/nartc/ngxtension-platform/commit/b8e9ccfda2e716a867a6d432f57b9cca323f33bf))


### Documentations

* add Pascalmh as a contributor for doc ([#119](https://github.com/nartc/ngxtension-platform/issues/119)) ([0e9e3fa](https://github.com/nartc/ngxtension-platform/commit/0e9e3fa1079790bcdaafbd24489fdccf4bb1fd3e))

## [0.7.2](https://github.com/nartc/ngxtension-platform/compare/0.7.1...0.7.2) (2023-10-17)


### Bug Fixes

* add devkit and nx to deps ([f86da1b](https://github.com/nartc/ngxtension-platform/commit/f86da1b07e4657b9e959aa9a4addf6ce7b7a2efa))

## [0.7.1](https://github.com/nartc/ngxtension-platform/compare/0.7.0...0.7.1) (2023-10-15)


### Bug Fixes

* ngzone issue in inject-is-intersecting and docs fixes ([7a903b2](https://github.com/nartc/ngxtension-platform/commit/7a903b2dcdc91cc9e84fab782f45a8661f8bdd00))

## [0.7.0](https://github.com/nartc/ngxtension-platform/compare/0.6.1...0.7.0) (2023-10-14)


### Features

* **activeElement:** introduce injectActiveElement ([#110](https://github.com/nartc/ngxtension-platform/issues/110)) ([48fdf25](https://github.com/nartc/ngxtension-platform/commit/48fdf253e7949e8b13f89747c79b1db6f54127bd))
* added inject-is-intersecting ([af94c79](https://github.com/nartc/ngxtension-platform/commit/af94c791d2651866658a373c2f620fc5f3bf9b39))
* added inject-lazy ([b81fad2](https://github.com/nartc/ngxtension-platform/commit/b81fad2c8c9100e5e0a99ec56be87f76f46a5061))
* **debug:** add extra subscribe, unsubscribe and finalize extra notifs ([#107](https://github.com/nartc/ngxtension-platform/issues/107)) ([#114](https://github.com/nartc/ngxtension-platform/issues/114)) ([8dc8330](https://github.com/nartc/ngxtension-platform/commit/8dc8330431f6058aea8eb7d7b1b3171f718e3c8b))
* **map-skip-undefined:** add mapSkipUndefined + filterUndefined operator ([#113](https://github.com/nartc/ngxtension-platform/issues/113)) ([1755b74](https://github.com/nartc/ngxtension-platform/commit/1755b74ea6b698ae0a4d0a9dac0277f18c70cd94))
* **test:** add observer-spy ([#106](https://github.com/nartc/ngxtension-platform/issues/106)) ([c119b6e](https://github.com/nartc/ngxtension-platform/commit/c119b6e0eaeb3d0a2184c01ccbfc03ad5448a089))


### Documentations

* add nevzatopcu as a contributor for code ([#111](https://github.com/nartc/ngxtension-platform/issues/111)) ([c1f5486](https://github.com/nartc/ngxtension-platform/commit/c1f548644a2ddf70a39f93d519923084b0330233))
* update create injection token ([#104](https://github.com/nartc/ngxtension-platform/issues/104)) ([bbf78ee](https://github.com/nartc/ngxtension-platform/commit/bbf78ee003fdc9858c9a125d349c1f4fed9f1650))

## [0.6.1](https://github.com/nartc/ngxtension-platform/compare/0.6.0...0.6.1) (2023-10-09)

## [0.6.0](https://github.com/nartc/ngxtension-platform/compare/0.4.0...0.6.0) (2023-10-09)


### Features

* **assert-injector:** add run mode for assertInjector ([#105](https://github.com/nartc/ngxtension-platform/issues/105)) ([837f4b4](https://github.com/nartc/ngxtension-platform/commit/837f4b45c3f66427c72bf34db4de9093a3b0befd))
* **gestures:** port use-gesture ([0a2e437](https://github.com/nartc/ngxtension-platform/commit/0a2e43739c40fc456bf4343e46c559bd6be63e03)), closes [#91](https://github.com/nartc/ngxtension-platform/issues/91)
* **host-binding:** add a hostBinding function, docs and tests ([#81](https://github.com/nartc/ngxtension-platform/issues/81)) ([ee5f8aa](https://github.com/nartc/ngxtension-platform/commit/ee5f8aa75bf0b0109a6992eedc6304f886bdc677))


### Bug Fixes

* **create-injection-token:** allow provideFn to accept factory ([#100](https://github.com/nartc/ngxtension-platform/issues/100)) ([55f31b3](https://github.com/nartc/ngxtension-platform/commit/55f31b3f9658fb54173d77db4f2e673159103a85))
* **create-injection-token:** allows multi token to work correctly ([#98](https://github.com/nartc/ngxtension-platform/issues/98)) ([f190b30](https://github.com/nartc/ngxtension-platform/commit/f190b30cce54d55f73425eead0ae32d0625003b8))


### Documentations

* categories utilities ([881d5f3](https://github.com/nartc/ngxtension-platform/commit/881d5f3b5858472dadf6ca41e460351cb45c0896))
* categories utilities ([791f4e7](https://github.com/nartc/ngxtension-platform/commit/791f4e76ab6a1d060eb1fada7628dfc39f5aa513))
* edit index.mdx content ([fd2f002](https://github.com/nartc/ngxtension-platform/commit/fd2f0022361c5906293dbe1cc237cb0f89d2b1f8))
* edit index.mdx content ([16b28bf](https://github.com/nartc/ngxtension-platform/commit/16b28bf1f7b2675d21ceccd63dd41d9f4e6139b6))
* fix getting-started sidebar order ([995df09](https://github.com/nartc/ngxtension-platform/commit/995df09305c829fe68c0ba5debfa8c76a1c2868f))
* fix getting-started sidebar order ([609ac8e](https://github.com/nartc/ngxtension-platform/commit/609ac8e8d7a2081f7dc818fb20ca8fbe0e0d238e))
* move singleton-proxy into misc ([dc746f5](https://github.com/nartc/ngxtension-platform/commit/dc746f5294464902dffb4b2637d72a99093deb82))
* update .all-contributorsrc ([8712c85](https://github.com/nartc/ngxtension-platform/commit/8712c85cf3da5f544d6456d17038819243ccf06a))
* update .all-contributorsrc ([f7af320](https://github.com/nartc/ngxtension-platform/commit/f7af32046992caa8bef04ec927333b2dd3c37191))
* update README.md ([f8031ae](https://github.com/nartc/ngxtension-platform/commit/f8031ae143e3d3660aaf335452b24d3a9ca81e99))
* update README.md ([cf79407](https://github.com/nartc/ngxtension-platform/commit/cf79407270572f42fc412e265e0c5fc82ac5ca37))

## [0.5.0](https://github.com/nartc/ngxtension-platform/compare/0.4.0...0.5.0) (2023-10-05)


### Features

* **gestures:** port use-gesture ([0a2e437](https://github.com/nartc/ngxtension-platform/commit/0a2e43739c40fc456bf4343e46c559bd6be63e03)), closes [#91](https://github.com/nartc/ngxtension-platform/issues/91)
* **host-binding:** add a hostBinding function, docs and tests ([#81](https://github.com/nartc/ngxtension-platform/issues/81)) ([ee5f8aa](https://github.com/nartc/ngxtension-platform/commit/ee5f8aa75bf0b0109a6992eedc6304f886bdc677))


### Bug Fixes

* **create-injection-token:** allows multi token to work correctly ([#98](https://github.com/nartc/ngxtension-platform/issues/98)) ([f190b30](https://github.com/nartc/ngxtension-platform/commit/f190b30cce54d55f73425eead0ae32d0625003b8))


### Documentations

* categories utilities ([881d5f3](https://github.com/nartc/ngxtension-platform/commit/881d5f3b5858472dadf6ca41e460351cb45c0896))
* categories utilities ([791f4e7](https://github.com/nartc/ngxtension-platform/commit/791f4e76ab6a1d060eb1fada7628dfc39f5aa513))
* edit index.mdx content ([fd2f002](https://github.com/nartc/ngxtension-platform/commit/fd2f0022361c5906293dbe1cc237cb0f89d2b1f8))
* edit index.mdx content ([16b28bf](https://github.com/nartc/ngxtension-platform/commit/16b28bf1f7b2675d21ceccd63dd41d9f4e6139b6))
* fix getting-started sidebar order ([995df09](https://github.com/nartc/ngxtension-platform/commit/995df09305c829fe68c0ba5debfa8c76a1c2868f))
* fix getting-started sidebar order ([609ac8e](https://github.com/nartc/ngxtension-platform/commit/609ac8e8d7a2081f7dc818fb20ca8fbe0e0d238e))
* move singleton-proxy into misc ([dc746f5](https://github.com/nartc/ngxtension-platform/commit/dc746f5294464902dffb4b2637d72a99093deb82))
* update .all-contributorsrc ([8712c85](https://github.com/nartc/ngxtension-platform/commit/8712c85cf3da5f544d6456d17038819243ccf06a))
* update .all-contributorsrc ([f7af320](https://github.com/nartc/ngxtension-platform/commit/f7af32046992caa8bef04ec927333b2dd3c37191))
* update README.md ([f8031ae](https://github.com/nartc/ngxtension-platform/commit/f8031ae143e3d3660aaf335452b24d3a9ca81e99))
* update README.md ([cf79407](https://github.com/nartc/ngxtension-platform/commit/cf79407270572f42fc412e265e0c5fc82ac5ca37))

## [0.4.0](https://github.com/nartc/ngxtension-platform/compare/0.3.3...0.4.0) (2023-10-03)


### Features

* **singleton-proxy:** add createSingletonProxy ([#89](https://github.com/nartc/ngxtension-platform/issues/89)) ([f11999e](https://github.com/nartc/ngxtension-platform/commit/f11999e86a70515f794604c9f9f79836eeb63f6e))


### Documentations

* update .all-contributorsrc ([c84d3f5](https://github.com/nartc/ngxtension-platform/commit/c84d3f57d87a166503165cde83c8feb31d0628b8))
* update README.md ([83f0721](https://github.com/nartc/ngxtension-platform/commit/83f07217321ece0f061049f1446cb81c5df9b4f3))

## [0.3.3](https://github.com/nartc/ngxtension-platform/compare/0.3.2...0.3.3) (2023-09-23)


### Bug Fixes

* **create-injection-token:** add injector to create injection token ([#78](https://github.com/nartc/ngxtension-platform/issues/78)) ([b3ebe4b](https://github.com/nartc/ngxtension-platform/commit/b3ebe4b25afd248ed511dd8cf34f1ea337abf6cd))

## [0.3.2](https://github.com/nartc/ngxtension-platform/compare/0.3.1...0.3.2) (2023-09-22)


### Documentations

* add [@wanoo21](https://github.com/wanoo21) as a contributor ([edbc505](https://github.com/nartc/ngxtension-platform/commit/edbc50592bc496819eb88d0cacdf518e70685e68))

## [0.3.1](https://github.com/nartc/ngxtension-platform/compare/0.3.0...0.3.1) (2023-09-18)


### Bug Fixes

* **inject-destroy:** add onDestroy to return value of injectDestroy ([#69](https://github.com/nartc/ngxtension-platform/issues/69)) ([7b13372](https://github.com/nartc/ngxtension-platform/commit/7b133723efefa99436dce696fed39099afb1cdb5))
* **navigation:** use autogenerate fonction to create navigation sidebar ([#68](https://github.com/nartc/ngxtension-platform/issues/68)) ([88221e1](https://github.com/nartc/ngxtension-platform/commit/88221e1735a465f7d90ce8c5af2de03d9f53f614))


### Documentations

* clean up titles ([62bd564](https://github.com/nartc/ngxtension-platform/commit/62bd564fe2cdf57df49cebbd297e225acf2b3b9d))
* improve rxjs helper docs ([#70](https://github.com/nartc/ngxtension-platform/issues/70)) ([8244855](https://github.com/nartc/ngxtension-platform/commit/8244855df7e4486e975868cebbf490a2468aa827))

## [0.3.0](https://github.com/nartc/ngxtension-platform/compare/0.2.0...0.3.0) (2023-09-18)


### Features

* **navigation-end:** add navigationEnd util function ([#52](https://github.com/nartc/ngxtension-platform/issues/52)) ([424f530](https://github.com/nartc/ngxtension-platform/commit/424f53042a5ebe5b2909da615838eb13a2fb22a8))
* **plugin:** expose init generator ([729f13b](https://github.com/nartc/ngxtension-platform/commit/729f13bb5dbb9653e5711f9ec8c7b72ded45b6b3))
* **rxjs:** create a set of rxjs operators ([#66](https://github.com/nartc/ngxtension-platform/issues/66)) ([b503134](https://github.com/nartc/ngxtension-platform/commit/b50313466bd9ba1ef858f25adf56f6beffc45e03))
* **track-id-prop:** add trackById and trackByProp directives [#33](https://github.com/nartc/ngxtension-platform/issues/33) ([#59](https://github.com/nartc/ngxtension-platform/issues/59)) ([fb11e15](https://github.com/nartc/ngxtension-platform/commit/fb11e159d742a82ef59887467c3be29193fdcc7f))


### Bug Fixes

* **filter-array:** add index to filterFn ([dcf7753](https://github.com/nartc/ngxtension-platform/commit/dcf77533bfbefdfa941707be7b67278e22cad7e2))
* **filter-nil:** update copy-paste name and export filterNil ([8d48907](https://github.com/nartc/ngxtension-platform/commit/8d48907f7e100addd9c28b0327a1d9a3cfd7ea3a))
* **map-array:** add index to mapFn ([325faef](https://github.com/nartc/ngxtension-platform/commit/325faef90c7701d03ca6be909eb9672e64b85621))


### Documentations

* add tomalaforge as a contributor for code ([#67](https://github.com/nartc/ngxtension-platform/issues/67)) ([63bf5ad](https://github.com/nartc/ngxtension-platform/commit/63bf5ad3890afcbc29ecb3af3229e83c892e553e))
* add tomer953 as a contributor for doc ([#62](https://github.com/nartc/ngxtension-platform/issues/62)) ([255def1](https://github.com/nartc/ngxtension-platform/commit/255def1eae23c1119260c7037dd456b5491910b3))
* add use-case for external `token` to `createInjectionToken` ([2d8798e](https://github.com/nartc/ngxtension-platform/commit/2d8798e283ad9ececc6b8983f00b358d17150235))
* add va-stefanek as a contributor for code ([#55](https://github.com/nartc/ngxtension-platform/issues/55)) ([efe357f](https://github.com/nartc/ngxtension-platform/commit/efe357f8ae057184b6376f29e0cbe3c14126ac1e))
* adjust track by doc ([450d82e](https://github.com/nartc/ngxtension-platform/commit/450d82e395f3b13a12c538fadc1c3084321fb5b5))
* connect fn ([#58](https://github.com/nartc/ngxtension-platform/issues/58)) ([809b3c3](https://github.com/nartc/ngxtension-platform/commit/809b3c3d53517d79b94d455825a3fc54a0f0db7f))
* inject-destroy ([#57](https://github.com/nartc/ngxtension-platform/issues/57)) ([cdbd2ad](https://github.com/nartc/ngxtension-platform/commit/cdbd2ad298852018e8e57b4e15b5592b51e658e2))

## [0.2.0](https://github.com/nartc/ngxtension-platform/compare/0.1.0...0.2.0) (2023-09-15)


### Features

* add if-validator ([#40](https://github.com/nartc/ngxtension-platform/issues/40)) ([7e6cf2e](https://github.com/nartc/ngxtension-platform/commit/7e6cf2eb0679188283853d5d4569cd0cbaaae3d1))
* **call-apply:** Implemented call apply Pipes ([#53](https://github.com/nartc/ngxtension-platform/issues/53)) ([a338920](https://github.com/nartc/ngxtension-platform/commit/a33892041524f50d47b4a0bb2ef60b1321a539ff)), closes [#35](https://github.com/nartc/ngxtension-platform/issues/35)
* **create-effect:** add createEffect ([48c4b19](https://github.com/nartc/ngxtension-platform/commit/48c4b19f086d803c7aa37d985130b9ba603c5e2e)), closes [#27](https://github.com/nartc/ngxtension-platform/issues/27)


### Bug Fixes

* **if-validator:** update logic if-validator ([#47](https://github.com/nartc/ngxtension-platform/issues/47)) ([f02b1ad](https://github.com/nartc/ngxtension-platform/commit/f02b1ad62ae0a7047f2821535376609b13002f01))
* **local-plugin:** add `testPathPattern` to convert entry point generator ([e198891](https://github.com/nartc/ngxtension-platform/commit/e1988919a758493034fb9236983efbaae6a3c2f9))


### Documentations

* add develite98 as a contributor for code ([#45](https://github.com/nartc/ngxtension-platform/issues/45)) ([8364fe5](https://github.com/nartc/ngxtension-platform/commit/8364fe5d054867ffcf97186b70bdb0b469ccbebd))
* add dmorosinotto as a contributor for code ([#54](https://github.com/nartc/ngxtension-platform/issues/54)) ([d20bbbb](https://github.com/nartc/ngxtension-platform/commit/d20bbbbabc7c75d144333603afd013b7f1d1df75))
* add tieppt as a contributor for code ([#48](https://github.com/nartc/ngxtension-platform/issues/48)) ([866714b](https://github.com/nartc/ngxtension-platform/commit/866714b0d1066da4ac34b13e6aa62a126f8a53af))
* clean up docs ([539a76e](https://github.com/nartc/ngxtension-platform/commit/539a76eeb991a5940843f25054db5367e92d2455))
* update CONTRIBUTING guide ([f9c384d](https://github.com/nartc/ngxtension-platform/commit/f9c384ddca6eeee883b9adc076b81b2585180d1e))
* update readme about if validator ([0b75c66](https://github.com/nartc/ngxtension-platform/commit/0b75c66c12d17ca4fcf4b02eb7047022b24c21dd))

## [0.1.0](https://github.com/nartc/ngxtension-platform/compare/0.1.0-beta.3...0.1.0) (2023-09-13)


### Features

* **ngxtension:** init library ([5e493a8](https://github.com/nartc/ngxtension-platform/commit/5e493a842a858c654c18016a9dcf4c173db99e54))
* **resize:** resize ([#5](https://github.com/nartc/ngxtension-platform/issues/5)) ([31bd35e](https://github.com/nartc/ngxtension-platform/commit/31bd35e95f07ba029d1a7a593348603215d5e664))
* added injector to computedFrom ([9f97b5b](https://github.com/nartc/ngxtension-platform/commit/9f97b5b8eff841d8d145a6d4d75d2a30204288c1))
* **assert-injector:** add `assertInjector` ([#17](https://github.com/nartc/ngxtension-platform/issues/17)) ([e1570a6](https://github.com/nartc/ngxtension-platform/commit/e1570a678cdaad3821bbd0ab455d1b639c675986)), closes [#15](https://github.com/nartc/ngxtension-platform/issues/15)
* **create-injection-token:** add createInjectionToken ([9d7a8ff](https://github.com/nartc/ngxtension-platform/commit/9d7a8ff3f934d72841286f2fa80ff777c323ca29))
* **repeat:** add Repeat directive ([#19](https://github.com/nartc/ngxtension-platform/issues/19)) ([1db2f48](https://github.com/nartc/ngxtension-platform/commit/1db2f48155166aca7d6278b7f702f99ff10e53d1)), closes [#14](https://github.com/nartc/ngxtension-platform/issues/14)
* added connect util fn ([ea5f1da](https://github.com/nartc/ngxtension-platform/commit/ea5f1daff949ad730834957c7e243364bca486c0))
* added inject-destroy ([1fdef68](https://github.com/nartc/ngxtension-platform/commit/1fdef68b902bc014d7dd02192b1faa9af31e12d0))
* simplify test scenarios ([43db19c](https://github.com/nartc/ngxtension-platform/commit/43db19c81d5072b71f9fd6ec78c5b7fc5638327a))
* simplify tests ([a175d3d](https://github.com/nartc/ngxtension-platform/commit/a175d3d6ccf0710af928fb036aa9242388216b6a))
* **plugin:** add plugin for generators ([#26](https://github.com/nartc/ngxtension-platform/issues/26)) ([554a35c](https://github.com/nartc/ngxtension-platform/commit/554a35cb0bded12f6ede6a29ccb357a07918cecf)), closes [#4](https://github.com/nartc/ngxtension-platform/issues/4)


### Bug Fixes

* comment out test case ([2c7147c](https://github.com/nartc/ngxtension-platform/commit/2c7147cba8d968404967ad1f2dd357ab4da157af))


### Documentations

* add [@nartc](https://github.com/nartc) as a contributor ([4c66122](https://github.com/nartc/ngxtension-platform/commit/4c66122153919787ab9098d90b580bc4cb0ee7b6))
* add eneajaho as a contributor for code ([#12](https://github.com/nartc/ngxtension-platform/issues/12)) ([ab046c0](https://github.com/nartc/ngxtension-platform/commit/ab046c093227618eec01ac5f194c6261a122a8ac))
* add jsdocs comments for all functions (except `computedFrom`) ([#24](https://github.com/nartc/ngxtension-platform/issues/24)) ([70ecb59](https://github.com/nartc/ngxtension-platform/commit/70ecb59f0c18a5f77e0956317ca909a6d58012c4)), closes [#18](https://github.com/nartc/ngxtension-platform/issues/18)
* update README ([3f57a63](https://github.com/nartc/ngxtension-platform/commit/3f57a63c3bdea474522ab7ebcc828c4949a9e8b3)), closes [#9](https://github.com/nartc/ngxtension-platform/issues/9)
* **repo:** add CONTRIBUTING guide ([#28](https://github.com/nartc/ngxtension-platform/issues/28)) ([82f3cce](https://github.com/nartc/ngxtension-platform/commit/82f3cce47464efada686ae22207cddf45fd216d7)), closes [#8](https://github.com/nartc/ngxtension-platform/issues/8)
* add documentation site by astro ([#29](https://github.com/nartc/ngxtension-platform/issues/29)) ([13aee69](https://github.com/nartc/ngxtension-platform/commit/13aee698b9fb9606487a93ed28d1bf60e41496bc)), closes [#10](https://github.com/nartc/ngxtension-platform/issues/10) [#10](https://github.com/nartc/ngxtension-platform/issues/10)
* add lastUpdated to starlight config ([7586e70](https://github.com/nartc/ngxtension-platform/commit/7586e70e4b16c2d0fad65d48075e483a9e2fd47a))
* added computedFrom docs ([#30](https://github.com/nartc/ngxtension-platform/issues/30)) ([765777f](https://github.com/nartc/ngxtension-platform/commit/765777ff054355652d29eb6c3258cba5d82f6e34))
* dummy ([d8ff6ab](https://github.com/nartc/ngxtension-platform/commit/d8ff6ab2c344011af0c45442bbfcfa86934605b8))

## [0.1.0-beta.3](https://github.com/nartc/ngxtension-platform/compare/0.1.0-beta.2...0.1.0-beta.3) (2023-09-13)


### Features

* **plugin:** add plugin for generators ([#26](https://github.com/nartc/ngxtension-platform/issues/26)) ([554a35c](https://github.com/nartc/ngxtension-platform/commit/554a35cb0bded12f6ede6a29ccb357a07918cecf)), closes [#4](https://github.com/nartc/ngxtension-platform/issues/4)


### Documentations

* **repo:** add CONTRIBUTING guide ([#28](https://github.com/nartc/ngxtension-platform/issues/28)) ([82f3cce](https://github.com/nartc/ngxtension-platform/commit/82f3cce47464efada686ae22207cddf45fd216d7)), closes [#8](https://github.com/nartc/ngxtension-platform/issues/8)

## [0.1.0-beta.2](https://github.com/nartc/ngxtension-platform/compare/0.1.0-beta.1...0.1.0-beta.2) (2023-09-13)


### Features

* added connect util fn ([ea5f1da](https://github.com/nartc/ngxtension-platform/commit/ea5f1daff949ad730834957c7e243364bca486c0))
* added inject-destroy ([1fdef68](https://github.com/nartc/ngxtension-platform/commit/1fdef68b902bc014d7dd02192b1faa9af31e12d0))
* simplify test scenarios ([43db19c](https://github.com/nartc/ngxtension-platform/commit/43db19c81d5072b71f9fd6ec78c5b7fc5638327a))
* simplify tests ([a175d3d](https://github.com/nartc/ngxtension-platform/commit/a175d3d6ccf0710af928fb036aa9242388216b6a))


### Bug Fixes

* comment out test case ([2c7147c](https://github.com/nartc/ngxtension-platform/commit/2c7147cba8d968404967ad1f2dd357ab4da157af))


### Documentations

* add jsdocs comments for all functions (except `computedFrom`) ([#24](https://github.com/nartc/ngxtension-platform/issues/24)) ([70ecb59](https://github.com/nartc/ngxtension-platform/commit/70ecb59f0c18a5f77e0956317ca909a6d58012c4)), closes [#18](https://github.com/nartc/ngxtension-platform/issues/18)
* update README ([3f57a63](https://github.com/nartc/ngxtension-platform/commit/3f57a63c3bdea474522ab7ebcc828c4949a9e8b3)), closes [#9](https://github.com/nartc/ngxtension-platform/issues/9)

## [0.1.0-beta.1](https://github.com/nartc/ngxtension-platform/compare/0.1.0-beta.0...0.1.0-beta.1) (2023-09-11)


### Features

* added injector to computedFrom ([9f97b5b](https://github.com/nartc/ngxtension-platform/commit/9f97b5b8eff841d8d145a6d4d75d2a30204288c1))
* **assert-injector:** add `assertInjector` ([#17](https://github.com/nartc/ngxtension-platform/issues/17)) ([e1570a6](https://github.com/nartc/ngxtension-platform/commit/e1570a678cdaad3821bbd0ab455d1b639c675986)), closes [#15](https://github.com/nartc/ngxtension-platform/issues/15)
* **create-injection-token:** add createInjectionToken ([9d7a8ff](https://github.com/nartc/ngxtension-platform/commit/9d7a8ff3f934d72841286f2fa80ff777c323ca29))
* **repeat:** add Repeat directive ([#19](https://github.com/nartc/ngxtension-platform/issues/19)) ([1db2f48](https://github.com/nartc/ngxtension-platform/commit/1db2f48155166aca7d6278b7f702f99ff10e53d1)), closes [#14](https://github.com/nartc/ngxtension-platform/issues/14)


### Documentations

* add eneajaho as a contributor for code ([#12](https://github.com/nartc/ngxtension-platform/issues/12)) ([ab046c0](https://github.com/nartc/ngxtension-platform/commit/ab046c093227618eec01ac5f194c6261a122a8ac))

## 0.1.0-beta.0 (2023-09-10)


### Features

* **ngxtension:** init library ([5e493a8](https://github.com/nartc/ngxtension-platform/commit/5e493a842a858c654c18016a9dcf4c173db99e54))
* **resize:** resize ([#5](https://github.com/nartc/ngxtension-platform/issues/5)) ([31bd35e](https://github.com/nartc/ngxtension-platform/commit/31bd35e95f07ba029d1a7a593348603215d5e664))


### Documentations

* add [@nartc](https://github.com/nartc) as a contributor ([4c66122](https://github.com/nartc/ngxtension-platform/commit/4c66122153919787ab9098d90b580bc4cb0ee7b6))

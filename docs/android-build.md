# Android build and API 36 migration

Branch: `feature/fix-android-build`. Build validation: 6–7 October 2026.

The Android template now compiles and produces a release APK and Android App
Bundle targeting Android 16, API 36. QA can use this branch to build and test the
application. Without an upload signing key, release artifacts use the existing
debug key and are suitable for local QA only.

## Why the upgrade was needed

Google Play requires new phone apps and app updates to target API 36 or higher
from 31 August 2026. The previous template targeted API 34. See
[Google Play target API requirements](https://developer.android.com/google/play/requirements/target-sdk).

QA found that the React Native 0.72.4 Gradle plugin could not compile with Gradle
8.11.1. This migration upgrades React Native and its build plugin together with
the Android toolchain. React Native 0.77 also adds Android 16 KB page support.
See the [React Native 0.77 release notes](https://reactnative.dev/blog/2025/01/21/version-0.77).

React Native 0.77.3 was selected as an intermediate upgrade that retains React 18
and the legacy architecture. It is now
[unsupported upstream](https://reactnative.dev/releases/overview); a move to a
maintained React Native release remains follow-up work. API targeting and a
successful build do not replace device testing or Google Play release checks.

## Build versions

| Component               | Previous configuration     | Current configuration      |
| ----------------------- | -------------------------- | -------------------------- |
| React Native            | 0.72.4                     | 0.77.3                     |
| React and React DOM     | 18.2.0                     | 18.3.1                     |
| Android Gradle Plugin   | 7.4.2, reported by QA      | 8.10.1, explicitly pinned  |
| Gradle wrapper          | 8.0.1                      | 8.11.1                     |
| Compile and target SDK  | 34                         | 36                         |
| Minimum SDK             | 24                         | 24                         |
| Android SDK Build Tools | 33.0.0                     | 35.0.0                     |
| Android NDK             | 23.1.7779620               | 27.1.12297006              |
| Kotlin                  | 1.8.21                     | 2.0.21                     |
| CMake                   | Module defaults            | 3.22.1 for Android modules |
| Java                    | Not pinned in the template | JDK 17                     |

AGP 8.10 supports API 36 and requires Gradle 8.11.1, Build Tools 35.0.0, and JDK 17. See [AGP 8.10 compatibility](https://developer.android.com/build/releases/agp-8-10-0-release-notes).
Hermes remains enabled and `newArchEnabled=false` remains the default.

## Prepare a QA checkout

### Install the tools

- Node.js 20 LTS and npm. The successful build used Node 20.19.4 and npm 10.8.2.
- JDK 17. Check `java -version` and ensure `JAVA_HOME` points to JDK 17.
- Android SDK command-line tools and platform tools.
- Android SDK Platform 36, Build Tools 35.0.0, NDK 27.1.12297006, and CMake 3.22.1.
- Python 3 for the native-library alignment checker.

Install the Android components through Android Studio's SDK Manager, with
**Show Package Details** enabled to select the exact NDK and CMake versions.
If `sdkmanager` is on your PATH, the equivalent command is:

```sh
sdkmanager "platform-tools" "platforms;android-36" "build-tools;35.0.0" "ndk;27.1.12297006" "cmake;3.22.1"
sdkmanager --licenses
```

Set `ANDROID_HOME` to your SDK directory, or create the ignored
`template/android/local.properties` with `sdk.dir` pointing to that directory.
Use the included Gradle wrapper; a separate global Gradle installation is not
required.

### Initialize the repository

Check out `feature/fix-android-build`. Run the following from the repository
root in a fresh checkout:

```sh
git clone --branch appbuilder-uikit-3.1.27 --single-branch https://github.com/AgoraIO-Community/appbuilder-ui-kit.git template/agora-rn-uikit
git -C template/agora-rn-uikit checkout 80228170785883ea5a805ea0939c0101b7a2425e
node devSetup.js meeting
```

The UI Kit commit above is the revision used for the local build. If the UI Kit
directory already exists, inspect it before switching revisions; preserve any
local work. The directory is ignored by this repository and is not included in
the Android migration commit.

`devSetup.js` creates the development configuration, theme, and dotfiles. Replace
`meeting` with the QA product mode if needed: `live-streaming`, `voice-chat`, or
`audio-livecast`. Add `light` after the mode for the light configuration. Verify
that `template/config.json` points to the intended QA backend and app settings.

### Install dependencies from the canonical lock file

On macOS or Linux:

```sh
cd template
cp _package-lock.json package-lock.json
npm ci --legacy-peer-deps --include=dev
```

On Windows PowerShell:

```powershell
Set-Location template
Copy-Item _package-lock.json package-lock.json
npm ci --legacy-peer-deps --include=dev
```

`_package-lock.json` is the tracked canonical lock file. `package-lock.json` is
ignored and must be copied from it before installing. Use `--legacy-peer-deps`
because several existing modules declare older React peer constraints; the
install dry run passed with this flag. `npm ci --force` failed with missing
transitive React peer entries, so it is not the QA install command for this
lock file.

Include development dependencies because the build tooling and `patch-package`
are installed there. Keep install scripts enabled: `postinstall` must apply
`@supersami/rn-foreground-service@1.1.1`. A patch failure stops installation.
The root `dev-setup` shortcut uses a different install flow; use the steps above
for this reproducible QA setup.

## Build the APK or AAB

Run these commands from `template/` after setup:

| Artifact                             | macOS or Linux                                      | Windows                                                |
| ------------------------------------ | --------------------------------------------------- | ------------------------------------------------------ |
| APK for installation on a device     | `npx cross-env CI=true npm run android:build:unix`  | `npx cross-env CI=true npm run android:build:windows`  |
| AAB for Google Play packaging checks | `npx cross-env CI=true npm run android:bundle:unix` | `npx cross-env CI=true npm run android:bundle:windows` |

The similar script names are intentional:

- `android` runs the development application with the React Native CLI.
- `android:build` aliases `android:build:unix` and produces an APK.
- `android:bundle` aliases `android:bundle:unix` and produces an AAB.
- The explicit Unix and Windows scripts select `gradlew` or `gradlew.bat`.

There are no duplicate script keys. APK tasks call `assembleRelease`; AAB tasks
call `bundleRelease`. Both sets follow the existing platform naming convention.

`CI=true` disables Watchman in Metro for these commands, avoiding dependence on
a running Watchman service. Metro release bundling uses at most four workers.
The first build downloads Gradle and Maven dependencies and can take longer
than subsequent builds.

The Gulp commands copy the artifact to
`Builds/android/<PRODUCT_ID>.apk` or `Builds/android/<PRODUCT_ID>.aab`, where
`PRODUCT_ID` comes from `template/config.json`. Each Gulp build clears the
`Builds/android` output directory first. The Gradle outputs remain at:

```text
template/android/app/build/outputs/apk/release/app-release.apk
template/android/app/build/outputs/bundle/release/app-release.aab
```

To build both artifacts together without the Gulp copy step, run from
`template/android/`:

```sh
# macOS or Linux
CI=true ./gradlew :app:assembleRelease :app:bundleRelease --console=plain
```

```powershell
# Windows PowerShell
$env:CI = "true"
.\gradlew.bat :app:assembleRelease :app:bundleRelease --console=plain
```

An AAB cannot be installed directly with `adb install`. Install the APK for
ordinary local testing; use bundletool or Google Play's internal testing flow
to test APKs generated from an AAB.

## Release signing and application identity

The checked-in template still has application ID `com.helloworld`, version code
`1`, and version name `1.0`. Set the production application ID and an appropriate
version code in `template/android/app/build.gradle` before uploading a release.
For an existing Play app, preserve its application ID and use a version code
higher than the last uploaded release.

Supply all four values as Gradle properties in your local
`~/.gradle/gradle.properties` or through environment variables:

```properties
APPBUILDER_UPLOAD_STORE_FILE=/absolute/path/to/upload.keystore
APPBUILDER_UPLOAD_STORE_PASSWORD=<store-password>
APPBUILDER_UPLOAD_KEY_ALIAS=<upload-key-alias>
APPBUILDER_UPLOAD_KEY_PASSWORD=<key-password>
```

Use an absolute keystore path. Gradle properties take precedence over the
corresponding environment variables. All four values configure upload-key
signing; a partial configuration fails with a clear error. When none are set,
the release build uses the existing Android debug key for QA. Do not upload
that debug-signed AAB to Google Play or commit keystores and passwords.

## Verify the artifacts

From the repository root:

```sh
python3 template/scripts/verify-android-native-libs.py template/android/app/build/outputs/apk/release/app-release.apk
python3 template/scripts/verify-android-native-libs.py template/android/app/build/outputs/bundle/release/app-release.aab
```

On Windows, use `py -3` if `python3` is not available. The checker examines
`arm64-v8a` and `x86_64` ELF load-segment alignment. For APKs it also checks the
ZIP offsets of uncompressed native libraries. The AAB check covers ELF
alignment; also check ZIP alignment in APKs generated from the AAB. See
[Android 16 KB page-size guidance](https://developer.android.com/guide/practices/page-sizes).

The checker also verifies that the packaged `libaosl.so` exports every required
`aosl_*` function imported by the other native libraries, across all packaged
ABIs. Treat missing-symbol failures as a release blocker: a build can succeed
and still crash when joining a call if an incompatible shared library is selected.

Using the tools from your SDK's `build-tools/35.0.0` directory:

```sh
aapt2 dump badging template/android/app/build/outputs/apk/release/app-release.apk
zipalign -c -P 16 -v 4 template/android/app/build/outputs/apk/release/app-release.apk
apksigner verify --print-certs template/android/app/build/outputs/apk/release/app-release.apk
```

Check that the target SDK is `36`, ZIP alignment verification succeeds, and
the certificate matches the intended QA or upload key. A debug-signed build
reports a certificate with `CN=Android Debug`.

Install on a connected test device from the repository root:

```sh
adb install -r template/android/app/build/outputs/apk/release/app-release.apk
```

## Changes and their reasons

Paths in this section are relative to `template/`.

### Dependencies and JavaScript tooling

`package.json` and `_package-lock.json` update React Native to 0.77.3 and React,
React DOM, and React Test Renderer to 18.3.1. React Native CLI and its Android
and iOS platform packages are explicitly installed at 15.0.1. React Native's
Babel preset, Metro configuration, and ESLint configuration use 0.77.3. Babel
core and runtime requirements and React types are updated; obsolete standalone
React Native types and the old Metro Babel preset are removed.

Native dependency changes address compilation and page-size compatibility:

| Package                 | Change                                                                  | Reason                                                                                              |
| ----------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Gesture Handler         | 2.8.0 to 2.25.0                                                         | Compatible native implementation for the upgraded RN toolchain.                                     |
| Reanimated              | 3.4.2 to 3.17.5                                                         | Compatible React Native/native build implementation while retaining Reanimated 3.                   |
| React Native SVG        | 13.6.0 to 15.11.2                                                       | Resolve native API compatibility with the newer RN version.                                         |
| React Native WebView    | 13.8.1 to 13.13.5                                                       | Resolve a Kotlin nullable-value compilation failure. The whiteboard override uses the same version. |
| React Native Agora Chat | 1.2.1 to 1.4.1                                                          | Replace bundled chat libraries that failed the x86_64 16 KB ELF alignment check.                    |
| Clipboard               | Community clipboard 1.5.1 to `@react-native-clipboard/clipboard` 1.16.3 | Replace a native module using removed RN APIs.                                                      |
| Safe Area Context       | Add 5.4.0                                                               | Support Android window insets when targeting API 36.                                                |
| Foreground service      | Pin 1.1.1                                                               | Keep the native compatibility patch tied to the reviewed package version.                           |
| Patch Package           | Add 8.0.0 and a failing-on-error postinstall hook                       | Apply native fixes after every dependency installation.                                             |

`babel.config.js` uses `module:@react-native/babel-preset`.
`metro.config.js` uses the Node file crawler when `CI=true` because Watchman
queries stalled during the local build.

### Android toolchain and integration

- `android/build.gradle` pins AGP, Kotlin, SDKs, Build Tools, NDK, and CMake.
  It applies React Native's root-project plugin. Legacy native modules use the
  same AGP version, have BuildConfig generation enabled, and receive an AGP 8
  namespace derived from their manifest when they do not declare one.
  CMake builds receive `ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON` for NDK 27's
  16 KB support. The Agora CDN Maven repository is scoped to Agora RTC groups
  to resolve their native artifacts.
- `android/settings.gradle` switches to the modern React Native settings
  plugin and autolinking API.
- `android/gradle/wrapper/gradle-wrapper.properties` selects Gradle 8.11.1's
  binary distribution and increases the download timeout to 60 seconds.
- `android/app/build.gradle` uses modern app autolinking, limits Metro to four
  workers, and adds optional upload signing. Old Kotlin 1.8.21 constraints and
  Flipper dependencies are removed.
  It declares `io.agora.infra:aosl:1.3.5` before React Native autolinking so that
  `pickFirst 'lib/**/libaosl.so'` selects this shared library ahead of the older
  copy bundled with RTM. This follows
  [Agora's SDK library-conflict guidance](https://doc.shengwang.cn/faq/integration-issues/rtm2-rtc-integration-issue).
- `android/app/src/main/java/com/helloworld/MainApplication.java` implements
  ReactHost access and initializes SoLoader with React Native's merged-library
  mapping, including the required IOException handling. Flipper initialization
  is removed.
- Both debug and release `ReactNativeFlipper.java` files are deleted, and
  `android/gradle.properties` removes the unused Flipper version setting.

### Android behavior and native patches

- `android/app/src/main/AndroidManifest.xml` declares microphone and media
  playback foreground-service permissions and service types. It opts out of
  the newer predictive-back behavior to preserve RN 0.77's existing back
  handling. See [Android 16 behavior changes](https://developer.android.com/about/versions/16/behavior-changes-16).
- `src/components/AppSafeAreaView.android.tsx` wraps Android content in Safe
  Area Context's provider and view. `src/components/AppSafeAreaView.tsx` retains
  the existing React Native view for other platforms. `src/AppWrapper.tsx`
  imports the platform-specific wrapper to account for Android edge-to-edge
  window insets.
- `src/pages/video-call/VideoCallScreen.native.tsx` waits for RTC tracks, checks
  microphone permission, and starts the foreground service only while the
  application is active. It cancels pending startup after unmount and reports
  startup errors. This avoids starting a microphone service before permission
  is granted or from the background.
- `patches/@supersami+rn-foreground-service+1.1.1.patch` adds immutable
  PendingIntent flags and replaces a removed React Native drawable reference
  with an Android framework icon.
- `src/subComponents/Clipboard.native.tsx` imports the replacement clipboard
  package. `src/atoms/CustomSwitch.tsx` drops an unused, removed ViewPropTypes
  import.

### Build commands and verification

- `Gulpfile.js` adds Unix and Windows AAB tasks and copies the output to
  `Builds/android`. `package.json` exposes the `android:bundle` commands while
  retaining existing APK commands.
- `scripts/verify-android-native-libs.py` checks APK/AAB alignment and shared
  Agora AOSL symbol compatibility using only Python's standard library.
- `src/pages/video-call/__tests__/VideoCallScreen.native.test.tsx` covers RTC
  readiness, permission granted and denied, background state, and unmount
  before a permission check resolves.
- `docs/android-build.md` in the repository root documents the migration and
  QA process. The root `Readme.md` links to it.

## Validation and QA handoff

### Call-entry crash found during device testing on 7 October

On a Samsung Galaxy M52 running Android 13, creating a room and opening the
join screen worked, but entering the video-call screen crashed. Native-loader
logs showed missing `aosl_ref_magic` for RTC and `aosl_so_register_group` for
Chat. Chat then failed with `Utils.nativeGetDohVendor()` / `UnsatisfiedLinkError`
because its native library had not loaded.

The previous duplicate-library `pickFirst` rules selected an older RTM copy of
`libaosl.so`. The explicit AOSL dependency described above fixes the selection
for both RTC and Chat. Existing QA APKs must be rebuilt and reinstalled; changing
the source or reconnecting to the internet does not replace a packaged library.
The native-library checker now rejects this exact missing-symbol combination.

The corrected APK and AAB rebuilt successfully on 7 October. Both passed
alignment checks for 73 64-bit libraries and AOSL import checks for 56 native
libraries across all four ABIs. The merged libraries matched AOSL 1.3.5 in
every ABI, and both artifacts contained those libraries after Gradle stripping.
The rebuilt APK was installed on the Samsung test phone. The tester confirmed
that entering the video-call screen now works without the previous crash.
The full Android 16 and call-feature QA checklist below still applies.

For device verification, connect the phone to the internet, install the rebuilt
APK, create a room, continue through the join screen, and confirm the video-call
screen opens with working audio, video, and chat. Then leave and join again.
Capture `adb logcat -b crash -v threadtime` if the app closes.

Local checks on 6 October 2026:

| Check                               | Result                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Release APK and AAB                 | `BUILD SUCCESSFUL`; both artifacts produced.                                                                                  |
| Android release lint                | Passed as part of the release build.                                                                                          |
| APK manifest                        | Compile SDK 36 and target SDK 36 confirmed with aapt2.                                                                        |
| Native-library checker              | 73 64-bit libraries checked in each artifact; zero alignment failures.                                                        |
| APK ZIP alignment                   | Passed Build Tools 35.0.0 zipalign with 16 KB page alignment.                                                                 |
| APK signing                         | Signature verified; current artifact uses the Android debug certificate.                                                      |
| Foreground-service regression tests | All five new tests passed.                                                                                                    |
| Existing Jest run                   | 24 existing suites and 106 tests passed; six vendored toast suites failed because `@testing-library/react-native` is missing. |
| Web production build                | Passed with warnings.                                                                                                         |
| Dependency install                  | `npm ci --dry-run --legacy-peer-deps --include=dev --ignore-scripts` passed; patch application separately passed.             |
| Source review                       | No duplicate package/lock JSON keys or overlapping dependency/devDependency entries; `git diff --check` passed.               |

To run the foreground-service regression tests from `template/`:

```sh
npm test -- src/pages/video-call/__tests__/VideoCallScreen.native.test.tsx --runInBand --watchman=false
```

The Gulp task listing also confirmed that `androidUnix`, `androidWin`,
`androidBundleUnix`, and `androidBundleWin` are registered.

The compilation used the local development checkout. Existing local UI Kit
edits and iOS project edits are outside this commit. QA should build its own
artifacts from the documented checkout and configuration.

Before approving the Android release, test on Android 16 and an older supported
Android version, including a 16 KB device or emulator:

1. Install, cold start, login, and join and leave calls.
2. Grant, deny, and re-grant microphone and camera permissions without crashes.
3. Check call notifications, background audio, screen lock, return to the app,
   and notification removal after leaving a call.
4. Check status/navigation bar insets, gesture and button navigation, Back,
   keyboard behavior, and supported screen sizes.
5. Exercise chat, WebView/whiteboard, clipboard, sharing, SVG, gestures,
   animations, and audio route changes because their native dependencies or
   startup flow were affected.
6. Verify the production application ID, version code, upload certificate, and
   APKs generated from the AAB before Google Play internal testing.

The RN and React dependency changes are shared with iOS and web. Web production
compilation passed, but iOS pods/build/runtime testing is still required before
an iOS release.

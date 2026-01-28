// Android App Links configuration
// This file serves the Digital Asset Links file for Android deep linking
// Documentation: https://developer.android.com/training/app-links/verify-android-applinks

export default function handler(_req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  // TODO: Replace "YOUR_SHA256_FINGERPRINT_HERE" with your actual SHA256 fingerprint
  // To get your SHA256 fingerprint, run:
  // For debug build:
  //   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  // For release build:
  //   keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
  // https://stackoverflow.com/questions/42290681/android-studio-only-gives-me-sha1-i-need-sha256

  res.status(200).send([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.helloworld',
        sha256_cert_fingerprints: [
          'YOUR_SHA256_FINGERPRINT_HERE', // Replace with actual SHA256 fingerprint
        ],
      },
    },
  ]);
}

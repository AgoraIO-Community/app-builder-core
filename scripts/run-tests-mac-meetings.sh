#!/bin/bash
set -e

echo 'export PATH=$PATH:/usr/local/bin' >> $HOME/.zshrc
source $HOME/.zshrc
SDK='iphoneos'
CONFIGURATION='Release'
uuid=`grep UUID -A1 -a ~/QA/Meeting/MeetingAppBuilderProvisionProfile.mobileprovision | grep -io "[-A-F0-9]\{36\}"`
teamid=`/usr/libexec/PlistBuddy -c 'Print :Entitlements:com.apple.developer.team-identifier' /dev/stdin <<< $(security cms -D -i ~/QA/Meeting/MeetingAppBuilderProvisionProfile.mobileprovision)`
CODE_SIGN_STYLE="Manual"
IDENTITY="Apple Distribution"
ArchiveLocation="~/QA/Meeting/HelloWorld.xcarchive"
ExportOptionsPlistLocation="~/QA/Meeting/ExportOptions.plist"


cd ${WORKSPACE}
npm run dev-setup -- meeting
cd template
cd ios
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install --repo-update
cd HelloWorld
sed -ie '\|<array>|,\|</array>|d' HelloWorld.entitlements
sed -ie '\|<key>.*</key>|d' HelloWorld.entitlements
cd Images.xcassets
rm -r AppIcon.appiconset
cp -r ~/QA/AppIconsIOS/Assets.xcassets/AppIcon.appiconset AppIcon.appiconset
cd ..
cd ..
sed -ie 's/org.reactjs.native.example./meeting.appbuilder.agora./g' HelloWorld.xcodeproj/project.pbxproj
xcrun agvtool new-version -all ${BUILD_NUMBER}
xcodebuild -project HelloWorld.xcodeproj -scheme HelloWorld -sdk iphoneos -configuration Release clean
xcodebuild archive -workspace HelloWorld.xcworkspace -scheme HelloWorld -configuration "$CONFIGURATION" -archivePath "$ArchiveLocation" DEVELOPMENT_TEAM=$teamid PROVISIONING_PROFILE_SPECIFIER=$uuid CODE_SIGN_STYLE="Manual" CODE_SIGN_IDENTITY="$IDENTITY"
xcodebuild -exportArchive -archivePath "$ArchiveLocation" -exportOptionsPlist ~/QA/Meeting/ExportOptions.plist

# uuid=`grep UUID -A1 -a ~/Downloads/LiveStreamingDistributionProfile.mobileprovision | grep -io "[-A-F0-9]\{36\}"`
# teamid=`/usr/libexec/PlistBuddy -c 'Print :Entitlements:com.apple.developer.team-identifier' /dev/stdin <<< $(security cms -D -i /Users/ningappakanamadi/Downloads/LiveStreamingDistributionProfile.mobileprovision)`
# echo "Found UUID" $uuid
# echo "done" $teamid

#uuid = '/usr/libexec/PlistBuddy -c 'Print :UUID' /dev/stdin <<< $(security cms -D -i /Users/ningappakanamadi/Downloads/LiveStreamingDistributionProfile.mobileprovision)'
#teamid=`/usr/libexec/PlistBuddy -c 'Print :UUID' /dev/stdin <<< $(security cms -D -i /Users/ningappakanamadi/Downloads/LiveStreamingDistributionProfile.mobileprovision)`






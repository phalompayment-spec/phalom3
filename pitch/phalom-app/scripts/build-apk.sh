#!/usr/bin/env bash
# Builds the Phalom Android app (out/Phalom.apk) without Android Studio or the Android SDK.
# Needs: Java 17+ (JDK), curl, unzip, Linux or macOS. Tools come from Maven Central and are checked by SHA-1:
#   aapt2 + Android 16 framework resources (Apktool 3.0.3), android.jar API 16 stubs, dx 1.7, Google apksig 2.3.0.
#
#   SERVER_URL=https://phalom.<you>.workers.dev ./scripts/build-apk.sh
# Without SERVER_URL the app asks for the server on first launch (and offers an offline demo).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$PWD
AND=$ROOT/android
TOOLS=${PHALOM_ANDROID_TOOLS:-$AND/.tools}
BUILD=$AND/build
OUT=${OUT:-$ROOT/out}
MIN_SDK=24
TARGET_SDK=35
VERSION_CODE=${VERSION_CODE:-$(date +%y%m%d%H)}
VERSION_NAME=${VERSION_NAME:-1.1}
KEYSTORE=${KEYSTORE:-$AND/phalom-demo.p12}
KEY_ALIAS=${KEY_ALIAS:-phalom}
KEY_PASS=${KEY_PASS:-phalom-demo}
M=https://repo.maven.apache.org/maven2

fetch() { # fetch <maven path> <sha1>
  local f=$TOOLS/$(basename "$1")
  if [ ! -f "$f" ]; then echo "downloading $(basename "$1")"; curl -fsSL "$M/$1" -o "$f.part" && mv "$f.part" "$f"; fi
  local got; got=$( (sha1sum "$f" 2>/dev/null || shasum -a 1 "$f") | cut -c1-40)
  [ "$got" = "$2" ] || { echo "checksum mismatch for $f"; rm -f "$f"; exit 1; }
}

mkdir -p "$TOOLS" "$OUT"
fetch org/apktool/apktool-lib/3.0.3/apktool-lib-3.0.3.jar b82ff729ab5ff617fa473347398d493dc588cf2c
fetch com/google/android/android/4.1.1.4/android-4.1.1.4.jar 3fb039385e71e9aa2ba547ea9ea8caa34a4ffac7
fetch com/google/android/tools/dx/1.7/dx-1.7.jar 70eab4a00d9f7ca8849e960a87f5b6736aa4ec11
fetch com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar 6ef7a58375aa68fb492b58edd97607bee8ee5c5c

case "$(uname -s)" in Darwin) PLAT=macosx ;; Linux) PLAT=linux ;; *) echo "Use Linux, macOS or WSL"; exit 1 ;; esac
if [ ! -x "$TOOLS/aapt2" ] || [ ! -f "$TOOLS/android-framework.jar" ]; then
  (cd "$TOOLS" && unzip -o -q apktool-lib-3.0.3.jar "prebuilt/$PLAT/aapt2" prebuilt/android-framework.jar \
    && mv "prebuilt/$PLAT/aapt2" aapt2 && mv prebuilt/android-framework.jar . && rm -rf prebuilt && chmod +x aapt2)
fi
AAPT2=$TOOLS/aapt2
JAVA_OPTS_QUIET="-Dfile.encoding=UTF-8 --add-exports=java.base/sun.security.x509=ALL-UNNAMED --add-exports=java.base/sun.security.pkcs=ALL-UNNAMED --add-exports=java.base/sun.security.util=ALL-UNNAMED"

rm -rf "$BUILD" && mkdir -p "$BUILD"/{res,gen,classes,stubs}
cp -R "$AND/res/." "$BUILD/res/"
# Bake the server address into res/values/strings.xml
URL=${SERVER_URL:-}
URL=${URL%/}
ESC=$(printf '%s' "$URL" | sed -e 's/[&/\]/\\&/g')
sed -i.bak -e "s/<string name=\"server_url\" translatable=\"false\"><\/string>/<string name=\"server_url\" translatable=\"false\">$ESC<\/string>/" "$BUILD/res/values/strings.xml" && rm -f "$BUILD/res/values/strings.xml.bak"
echo "server: ${URL:-<asked on first launch>}"

echo "1/6 resources"
"$AAPT2" compile --dir "$BUILD/res" -o "$BUILD/res.zip"
"$AAPT2" link -o "$BUILD/base.apk" -I "$TOOLS/android-framework.jar" --manifest "$AND/AndroidManifest.xml" \
  -A "$AND/assets" --java "$BUILD/gen" --min-sdk-version $MIN_SDK --target-sdk-version $TARGET_SDK \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME" "$BUILD/res.zip"

echo "2/6 java"
javac -nowarn -Xlint:-options -encoding UTF-8 --release 8 -d "$BUILD/stubs" "$AND"/stubs/android/webkit/*.java
javac -nowarn -Xlint:-options -encoding UTF-8 --release 8 \
  -cp "$TOOLS/android-4.1.1.4.jar:$BUILD/stubs" -d "$BUILD/classes" $(find "$AND/src" "$BUILD/gen" -name '*.java')

echo "3/6 dex"
java $JAVA_OPTS_QUIET -cp "$TOOLS/apksig-2.3.0.jar" "$AND/build-tools/PhalomApk.java" classver "$BUILD/classes" 50
java -cp "$TOOLS/dx-1.7.jar" com.android.dx.command.Main --dex --output="$BUILD/classes.dex" "$BUILD/classes"

echo "4/6 package"
java $JAVA_OPTS_QUIET -cp "$TOOLS/apksig-2.3.0.jar" "$AND/build-tools/PhalomApk.java" adddex "$BUILD/base.apk" "$BUILD/classes.dex" "$BUILD/unsigned.apk"

echo "5/6 sign"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -storetype PKCS12 -keystore "$KEYSTORE" -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$KEY_PASS" -keypass "$KEY_PASS" -dname "CN=Phalom Demo, O=Team Phalom, C=LA" 2>/dev/null
  echo "created signing key $KEYSTORE (keep it: updates must be signed with the same key)"
fi
java $JAVA_OPTS_QUIET -cp "$TOOLS/apksig-2.3.0.jar" "$AND/build-tools/PhalomApk.java" sign "$BUILD/unsigned.apk" "$OUT/Phalom.apk" "$KEYSTORE" "$KEY_ALIAS" "$KEY_PASS" $MIN_SDK

echo "6/6 verify"
java $JAVA_OPTS_QUIET -cp "$TOOLS/apksig-2.3.0.jar" "$AND/build-tools/PhalomApk.java" verify "$OUT/Phalom.apk" $MIN_SDK
"$AAPT2" dump badging "$OUT/Phalom.apk" | grep -E "^(package|sdkVersion|targetSdkVersion|application-label|launchable-activity)" || true
ls -l "$OUT/Phalom.apk"
echo "Copy out/Phalom.apk to the phone and open it (allow \"Install unknown apps\" for your file manager or browser)."

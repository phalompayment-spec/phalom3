"""Builds android/assets/demo/index.html from the Phalom prototype (one HTML file).
Usage: python3 make-demo.py <prototype.html> <android/assets/demo/index.html>
Makes it work offline inside the app: local QR library, Android text-to-speech, a button back to setup."""
import sys
src = open(sys.argv[1], encoding="utf-8").read()
cdn = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"
assert src.count(cdn) == 1
src = src.replace(cdn, "qrcode.js")
old = "function speak(k){\n  try{const ss=window.speechSynthesis;if(!ss)return;"
assert old in src
src = src.replace(old, "function speak(k){\n  if(window.PhalomAndroid){try{setTimeout(()=>PhalomAndroid.speak('ໄດ້ຮັບເງິນ '+fmt(k)+' ກີບ','ได้รับเงิน '+fmt(k)+' กีบ'),450)}catch(e){}return}\n  try{const ss=window.speechSynthesis;if(!ss)return;", 1)
head = '<!doctype html>\n<html lang="lo">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
tail = '''
<button id="android-setup" type="button" hidden style="position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:50;border:0;border-radius:999px;padding:7px 12px;font:600 12px 'Noto Sans Lao',system-ui,sans-serif;background:#D99A1E;color:#151A33;box-shadow:0 6px 16px rgba(15,20,50,.25)">ໂໝດສາທິດ · ເຊື່ອມຕໍ່ເຊີບເວີ</button>
<script>(function(){var b=document.getElementById('android-setup');if(window.PhalomAndroid){b.hidden=false;b.onclick=function(){PhalomAndroid.openSetup()}}})();</script>
</body>
</html>
'''
open(sys.argv[2], "w", encoding="utf-8").write(head + src + tail)
print("wrote", sys.argv[2])

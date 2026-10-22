import sys,zipfile,re,shutil
src=sys.argv[1];tmp=src+'.tmp'
zin=zipfile.ZipFile(src);zout=zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    d=zin.read(it.filename)
    if it.filename.startswith('ppt/theme/'):
        s=d.decode('utf8')
        s=s.replace('<a:cs typeface=""/>','<a:cs typeface="Noto Sans Lao"/>')
        s=re.sub(r'<a:font script="Laoo" typeface="[^"]*"/>','<a:font script="Laoo" typeface="Noto Sans Lao"/>',s)
        d=s.encode('utf8')
    zout.writestr(it,d)
zout.close();shutil.move(tmp,src)

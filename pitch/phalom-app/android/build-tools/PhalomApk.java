import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;

import java.io.*;
import java.nio.file.*;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.zip.*;

/**
 * Small build helper for scripts/build-apk.sh, run with `java -cp apksig.jar PhalomApk.java <cmd>`.
 *   classver <dir> <major>                       rewrite .class files to an older class-file version for dx
 *   adddex <in.apk> <classes.dex> <out.apk>      add classes.dex, keeping resources.arsc stored (uncompressed)
 *   sign <in.apk> <out.apk> <keystore> <alias> <password> <minSdk>   v2 signature, plus v1 below Android 7 (apksig aligns entries)
 *   verify <apk> <minSdk>
 */
public class PhalomApk {
    public static void main(String[] a) throws Exception {
        switch (a[0]) {
            case "classver": classver(Paths.get(a[1]), Integer.parseInt(a[2])); break;
            case "adddex": addDex(new File(a[1]), new File(a[2]), new File(a[3])); break;
            case "sign": sign(new File(a[1]), new File(a[2]), new File(a[3]), a[4], a[5].toCharArray(), Integer.parseInt(a[6])); break;
            case "verify": verify(new File(a[1]), Integer.parseInt(a[2])); break;
            default: throw new IllegalArgumentException(a[0]);
        }
    }

    // The code uses no Java 7+ bytecode features (no lambdas, no invokedynamic), so only the header changes.
    static void classver(Path dir, int major) throws IOException {
        List<Path> files = new ArrayList<>();
        try (java.util.stream.Stream<Path> s = Files.walk(dir)) { s.filter(p -> p.toString().endsWith(".class")).forEach(files::add); }
        for (Path p : files) {
            byte[] b = Files.readAllBytes(p);
            if ((b[0] & 0xff) != 0xCA || (b[1] & 0xff) != 0xFE) throw new IOException("not a class: " + p);
            b[4] = 0; b[5] = 0; b[6] = (byte) (major >> 8); b[7] = (byte) major;
            Files.write(p, b);
        }
        System.out.println("class files: " + files.size() + " -> version " + major);
    }

    // Writes the zip by hand so every stored (uncompressed) entry starts on a 4-byte boundary, as Android 11+
    // requires for resources.arsc. The padding goes in a 0xD935 extra field, the same marker zipalign and apksig use.
    static void addDex(File in, File dex, File out) throws IOException {
        List<String> names = new ArrayList<>();
        Map<String, byte[]> data = new LinkedHashMap<>();
        Map<String, Boolean> stored = new HashMap<>();
        try (ZipFile z = new ZipFile(in)) {
            for (Enumeration<? extends ZipEntry> en = z.entries(); en.hasMoreElements(); ) {
                ZipEntry e = en.nextElement();
                if (e.isDirectory() || e.getName().equals("classes.dex")) continue;
                names.add(e.getName());
                data.put(e.getName(), readAll(z.getInputStream(e)));
                stored.put(e.getName(), e.getMethod() == ZipEntry.STORED || e.getName().equals("resources.arsc"));
            }
        }
        names.add("classes.dex");
        data.put("classes.dex", Files.readAllBytes(dex.toPath()));
        stored.put("classes.dex", false);

        ByteArrayOutputStream body = new ByteArrayOutputStream(), cd = new ByteArrayOutputStream();
        for (String name : names) {
            byte[] raw = data.get(name), nb = name.getBytes("UTF-8");
            boolean st = stored.get(name);
            CRC32 crc = new CRC32(); crc.update(raw);
            byte[] payload = st ? raw : deflate(raw);
            int offset = body.size();
            byte[] extra = new byte[0];
            if (st) {
                int pad = (4 - ((offset + 30 + nb.length + 6) % 4)) % 4;
                extra = new byte[6 + pad];
                le16(extra, 0, 0xD935); le16(extra, 2, 2 + pad); le16(extra, 4, 4);
            }
            int method = st ? 0 : 8, ver = st ? 10 : 20;
            DataOut h = new DataOut(body);
            h.i32(0x04034b50); h.i16(ver); h.i16(0x0800); h.i16(method); h.i16(0); h.i16(0x0021);
            h.i32((int) crc.getValue()); h.i32(payload.length); h.i32(raw.length); h.i16(nb.length); h.i16(extra.length);
            body.write(nb); body.write(extra); body.write(payload);
            DataOut c = new DataOut(cd);
            c.i32(0x02014b50); c.i16(20); c.i16(ver); c.i16(0x0800); c.i16(method); c.i16(0); c.i16(0x0021);
            c.i32((int) crc.getValue()); c.i32(payload.length); c.i32(raw.length); c.i16(nb.length); c.i16(0); c.i16(0);
            c.i16(0); c.i16(0); c.i32(0); c.i32(offset);
            cd.write(nb);
        }
        int cdOffset = body.size();
        byte[] cdb = cd.toByteArray();
        body.write(cdb);
        DataOut e = new DataOut(body);
        e.i32(0x06054b50); e.i16(0); e.i16(0); e.i16(names.size()); e.i16(names.size()); e.i32(cdb.length); e.i32(cdOffset); e.i16(0);
        Files.write(out.toPath(), body.toByteArray());
    }

    static byte[] deflate(byte[] raw) {
        Deflater d = new Deflater(9, true);
        d.setInput(raw); d.finish();
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        while (!d.finished()) o.write(buf, 0, d.deflate(buf));
        d.end();
        return o.toByteArray();
    }

    static void le16(byte[] b, int at, int v) { b[at] = (byte) v; b[at + 1] = (byte) (v >> 8); }

    static class DataOut {
        final ByteArrayOutputStream o;
        DataOut(ByteArrayOutputStream o) { this.o = o; }
        void i16(int v) { o.write(v & 0xff); o.write((v >> 8) & 0xff); }
        void i32(int v) { i16(v & 0xffff); i16((v >>> 16) & 0xffff); }
    }

    static byte[] readAll(InputStream is) throws IOException {
        try (InputStream i = is) { return i.readAllBytes(); }
    }

    static void sign(File in, File out, File ks, String alias, char[] pw, int minSdk) throws Exception {
        KeyStore store = KeyStore.getInstance("PKCS12");
        try (InputStream is = new FileInputStream(ks)) { store.load(is, pw); }
        PrivateKey key = (PrivateKey) store.getKey(alias, pw);
        List<X509Certificate> chain = new ArrayList<>();
        for (java.security.cert.Certificate c : store.getCertificateChain(alias)) chain.add((X509Certificate) c);
        ApkSigner.SignerConfig cfg = new ApkSigner.SignerConfig.Builder("PHALOM", key, chain).build();
        new ApkSigner.Builder(Collections.singletonList(cfg))
                .setInputApk(in).setOutputApk(out).setMinSdkVersion(minSdk)
                .setV1SigningEnabled(minSdk < 24).setV2SigningEnabled(true).setCreatedBy("Phalom build-apk.sh")
                .build().sign();
        System.out.println("signed " + out);
    }

    static void verify(File apk, int minSdk) throws Exception {
        ApkVerifier.Result r = new ApkVerifier.Builder(apk).setMinCheckedPlatformVersion(minSdk).build().verify();
        System.out.println("verified=" + r.isVerified() + " v1=" + r.isVerifiedUsingV1Scheme() + " v2=" + r.isVerifiedUsingV2Scheme());
        for (Object e : r.getErrors()) System.out.println("ERROR " + e);
        for (Object w : r.getWarnings()) System.out.println("WARN " + w);
        if (!r.isVerified()) System.exit(1);
        X509Certificate c = r.getSignerCertificates().get(0);
        byte[] d = java.security.MessageDigest.getInstance("SHA-256").digest(c.getEncoded());
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < d.length; i++) sb.append(i > 0 ? ":" : "").append(String.format("%02X", d[i]));
        System.out.println("cert sha256 " + sb);
    }
}

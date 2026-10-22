package la.phalom.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.content.pm.PackageManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/**
 * Phalom merchant app for Android.
 * Opens the Phalom web app (Cloudflare Worker + Supabase) full screen, reads incoming
 * payments aloud with Android text-to-speech, and keeps a bundled offline demo.
 */
public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    static final String SETUP = "file:///android_asset/setup.html";
    static final String DEMO = "file:///android_asset/demo/index.html";

    WebView web;
    SharedPreferences prefs;
    TextToSpeech tts;
    boolean ttsReady, ttsLao;
    static final int REQ_LOCATION = 7;
    static final String[] LOCATION = { "android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION" };
    GeolocationPermissions.Callback pendingGeo;
    String pendingOrigin;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        prefs = getSharedPreferences("phalom", MODE_PRIVATE);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setUserAgentString(s.getUserAgentString() + " PhalomAndroid/1.1");
        try { // API 17+: let the payment chime play without an extra tap
            WebSettings.class.getMethod("setMediaPlaybackRequiresUserGesture", boolean.class).invoke(s, false);
        } catch (Exception ignored) { }

        web.addJavascriptInterface(new Bridge(), "PhalomAndroid");
        s.setGeolocationEnabled(true);
        web.setWebChromeClient(new Chrome());
        web.setWebViewClient(new Client());
        tts = new TextToSpeech(this, this);

        if (saved != null && web.restoreState(saved) != null) return;
        loadStart();
    }

    String server() {
        String v = prefs.getString("server", null);
        if (v == null) v = getString(R.string.server_url);
        return v == null ? "" : v.trim();
    }

    void loadStart() {
        String srv = server();
        if ("demo".equals(prefs.getString("mode", ""))) web.loadUrl(DEMO);
        else if (srv.length() > 0) web.loadUrl(srv + "/?source=android");
        else web.loadUrl(SETUP);
    }

    static boolean sameOrigin(Uri a, Uri b) {
        return a.getScheme() != null && a.getScheme().equalsIgnoreCase(b.getScheme())
                && a.getHost() != null && a.getHost().equalsIgnoreCase(b.getHost())
                && a.getPort() == b.getPort();
    }

    // The shop map page asks for the phone's location to pin the shop.
    // Built against old SDK stubs, so the Android 6+ runtime permission calls go through reflection.
    class Chrome extends WebChromeClient {
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
            if (hasLocation()) { callback.invoke(origin, true, false); return; }
            pendingOrigin = origin; pendingGeo = callback;
            try {
                Activity.class.getMethod("requestPermissions", String[].class, int.class).invoke(MainActivity.this, LOCATION, REQ_LOCATION);
            } catch (Exception e) { callback.invoke(origin, true, false); pendingGeo = null; } // Android 5 and older: granted at install
        }
    }

    boolean hasLocation() {
        try {
            Object r = android.content.Context.class.getMethod("checkSelfPermission", String.class).invoke(this, LOCATION[0]);
            Object r2 = android.content.Context.class.getMethod("checkSelfPermission", String.class).invoke(this, LOCATION[1]);
            return ((Integer) r) == PackageManager.PERMISSION_GRANTED || ((Integer) r2) == PackageManager.PERMISSION_GRANTED;
        } catch (Exception e) { return true; }
    }

    // Activity callback on Android 6+ (not in the old stubs, so no @Override).
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        if (code != REQ_LOCATION || pendingGeo == null) return;
        boolean ok = false;
        for (int r : results) ok |= r == PackageManager.PERMISSION_GRANTED;
        pendingGeo.invoke(pendingOrigin, ok, false);
        pendingGeo = null;
    }

    class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url.startsWith("file:///android_asset/")) return false;
            String srv = server();
            Uri u = Uri.parse(url);
            if (srv.length() > 0 && sameOrigin(u, Uri.parse(srv))) return false;
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
            return true; // anything outside the Phalom server opens in the browser
        }

        @Override
        public void onReceivedError(WebView view, int code, String description, String failingUrl) {
            if (failingUrl != null && !failingUrl.startsWith("file:")) view.loadUrl(SETUP + "#offline");
        }
    }

    /** Called from JavaScript as window.PhalomAndroid. Only Phalom's own pages load in this view. */
    class Bridge {
        @JavascriptInterface
        public void speak(String lao, String thai) { say(lao, thai); }

        @JavascriptInterface
        public String getServer() { return server(); }

        @JavascriptInterface
        public void setServer(String url) {
            String v = url == null ? "" : url.trim();
            while (v.endsWith("/")) v = v.substring(0, v.length() - 1);
            if (v.length() > 0 && !v.startsWith("http://") && !v.startsWith("https://")) v = "https://" + v;
            prefs.edit().putString("server", v).putString("mode", "").apply();
            reload();
        }

        @JavascriptInterface
        public void useDemo() {
            prefs.edit().putString("mode", "demo").apply();
            reload();
        }

        @JavascriptInterface
        public void openSetup() {
            prefs.edit().putString("mode", "").apply();
            runOnUiThread(new Runnable() { public void run() { web.loadUrl(SETUP); } });
        }

        @JavascriptInterface
        public void retry() { reload(); }

        @JavascriptInterface
        public String version() { return "1.1"; }
    }

    void reload() {
        runOnUiThread(new Runnable() { public void run() { web.clearHistory(); loadStart(); } });
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) return;
        Locale lao = new Locale("lo", "LA"), thai = new Locale("th", "TH");
        if (tts.isLanguageAvailable(lao) >= TextToSpeech.LANG_AVAILABLE) { tts.setLanguage(lao); ttsLao = true; ttsReady = true; }
        else if (tts.isLanguageAvailable(thai) >= TextToSpeech.LANG_AVAILABLE) { tts.setLanguage(thai); ttsReady = true; }
        else { ttsReady = true; } // device default voice still says the number
    }

    void say(String lao, String thai) {
        if (!ttsReady || tts == null) return;
        tts.speak(ttsLao ? lao : thai, TextToSpeech.QUEUE_FLUSH, null);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onPause() { web.onPause(); super.onPause(); }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }
}

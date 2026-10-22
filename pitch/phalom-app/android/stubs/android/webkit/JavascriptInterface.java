package android.webkit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Compile-time stand-in for the API 17 annotation (the Maven Central android.jar is API 16).
// Not packaged: on the phone the real android.webkit.JavascriptInterface is used.
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface JavascriptInterface {}

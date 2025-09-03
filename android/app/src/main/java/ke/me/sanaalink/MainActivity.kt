package ke.me.sanaalink

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import ke.me.sanaalink.ui.theme.SanaaLinkTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SanaaLinkTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    SanaaLinkWebView(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    )
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SanaaLinkWebView(modifier: Modifier = Modifier) {
    var isLoading by remember { mutableStateOf(true) }
    val url = "https://sanaalink.netlify.app/"

    Box(modifier = modifier.fillMaxSize()) {
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    // It's good practice to have a WebViewClient to handle page navigation
                    // and prevent URLs from opening in an external browser.
                    webViewClient = WebViewClient()

                    webChromeClient = object : WebChromeClient() {
                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            super.onProgressChanged(view, newProgress)
                            isLoading = newProgress < 100
                        }
                    }
                    // Enable JavaScript
                    settings.javaScriptEnabled = true
                    // Enable DOM Storage
                    settings.domStorageEnabled = true
                    // Enable responsive layout
                    settings.useWideViewPort = true
                    // Zoom out if the content宽度大于webview可见宽度
                    settings.loadWithOverviewMode = true
                    loadUrl(url)
                }
            },
            modifier = Modifier.fillMaxSize()
        )
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}

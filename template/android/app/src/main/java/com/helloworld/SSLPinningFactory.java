package com.helloworld; 

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;
import okhttp3.CertificatePinner;
import okhttp3.OkHttpClient;
import android.content.Context;

public class SSLPinningFactory implements OkHttpClientFactory {
   private Context context;

   public SSLPinningFactory(Context context) {
       this.context = context;
   }

   public OkHttpClient createNewNetworkModuleClient() {
     
      String hostname = context.getString(R.string.hostname); 
      String main_public_key = context.getString(R.string.main_public_key);
      String backup_public_key = context.getString(R.string.backup_public_key);

      CertificatePinner certificatePinner = new CertificatePinner.Builder()
        .add(hostname, "sha256/"+ main_public_key)
        .add(hostname, "sha256/"+ backup_public_key)
        .build();

      OkHttpClient.Builder clientBuilder = OkHttpClientProvider.createClientBuilder();
      return clientBuilder.certificatePinner(certificatePinner).build();
  }
}
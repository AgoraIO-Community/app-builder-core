package com.helloworld; // your domain here

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;
import okhttp3.CertificatePinner;
import okhttp3.OkHttpClient;

public class SSLPinningFactory implements OkHttpClientFactory {
   private static String hostname = "managedservices-preprod.rteappbuilder.com";

   public OkHttpClient createNewNetworkModuleClient() {

      CertificatePinner certificatePinner = new CertificatePinner.Builder()
        .add(hostname, "sha256/pCL9CdYsDVWtkF3DktsMyfmuSGsnKNzAraubM/2JawQ=")
        .add(hostname, "sha256/18tkPyr2nckv4fgo0dhAkaUtJ2hu2831xlO2SKhq8dg=")
        .build();

      OkHttpClient.Builder clientBuilder = OkHttpClientProvider.createClientBuilder();
      return clientBuilder.certificatePinner(certificatePinner).build();
  }
}
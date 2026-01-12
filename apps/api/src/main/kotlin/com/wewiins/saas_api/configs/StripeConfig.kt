package com.wewiins.saas_api.configs

import com.stripe.StripeClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@Configuration
class StripeConfig {

    @Value("\${stripe.secret-key}")
    private lateinit var stripeApiKey: String

    @Bean
    fun stripeClient(): StripeClient {
        return StripeClient.builder()
            .setApiKey(stripeApiKey)
            .setMaxNetworkRetries(2)
            .build()
    }
}

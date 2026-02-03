package com.wewiins.saas_api.configs

import com.wewiins.saas_api.interceptors.ProviderVerificationInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val providerVerificationInterceptor: ProviderVerificationInterceptor
): WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(providerVerificationInterceptor)
            .addPathPatterns("/orchestration/**", "/dashboard/**")
    }
}
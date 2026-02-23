package com.wewiins.saas_api.configs

import com.wewiins.saas_api.utils.JacksonSerializer
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.ktor.client.engine.java.Java
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Bean

@Configuration
class SupabaseConfig {

    @Value("\${supabase.url}")
    private lateinit var supabaseUrl: String

    @Value("\${supabase.service-role.key}")
    private lateinit var supabaseKey: String

    @Bean
    fun supabaseClient(): SupabaseClient {
        return createSupabaseClient(
            supabaseUrl = supabaseUrl,
            supabaseKey = supabaseKey
        ) {
            install(Postgrest)
            install(Storage)
            defaultSerializer = JacksonSerializer()
            httpEngine = Java.create()
        }
    }
}
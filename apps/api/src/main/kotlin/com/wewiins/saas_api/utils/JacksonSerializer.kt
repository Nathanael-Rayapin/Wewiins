package com.wewiins.saas_api.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.jan.supabase.SupabaseSerializer
import com.fasterxml.jackson.module.kotlin.KotlinFeature
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.module.kotlin.KotlinModule
import kotlin.reflect.KType
import kotlin.reflect.javaType

class JacksonSerializer(
    private val mapper: ObjectMapper = jacksonObjectMapper().apply {
        registerModule(JavaTimeModule())

        // Configurer le module Kotlin pour gérer correctement les nulls
        registerModule(
            KotlinModule.Builder()
                .withReflectionCacheSize(512)
                .configure(KotlinFeature.NullToEmptyCollection, false)
                .configure(KotlinFeature.NullToEmptyMap, false)
                .configure(KotlinFeature.NullIsSameAsDefault, true) // Important !
                .configure(KotlinFeature.StrictNullChecks, false)   // Important !
                .build()
        )

        // Ignorer les propriétés inconnues et gérer les nulls
        configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false)// Pour OffsetDateTime, LocalDate
    }
) : SupabaseSerializer {
    override fun <T : Any> encode(type: KType, value: T): String =
        mapper.writeValueAsString(value)

    @OptIn(ExperimentalStdlibApi::class)
    override fun <T : Any> decode(type: KType, value: String): T =
        mapper.readValue(value, mapper.constructType(type.javaType))
}
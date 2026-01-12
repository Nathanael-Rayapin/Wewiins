package com.wewiins.saas_api.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.jan.supabase.SupabaseSerializer
import kotlin.reflect.KType
import kotlin.reflect.javaType

class JacksonSerializer(
    private val mapper: ObjectMapper = jacksonObjectMapper().apply {
        registerModule(JavaTimeModule()) // Pour OffsetDateTime, LocalDate
    }
): SupabaseSerializer {
    override fun <T : Any> encode(type: KType, value: T): String =
        mapper.writeValueAsString(value)

    @OptIn(ExperimentalStdlibApi::class)
    override fun <T : Any> decode(type: KType, value: String): T =
        mapper.readValue(value, mapper.constructType(type.javaType))
}
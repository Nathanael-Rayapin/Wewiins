package com.wewiins.saas_api.models.enums

enum class BookingType {
    EXPIRING,
    DAY,
    HOUR,
}

enum class BookingStatus {
    FINISH,
    COMING_SOON,
    CANCEL,
    PENDING,
    PAYMENT_FAILED,
}
package com.wewiins.saas_api.interfaces

data class DashboardStats(
    val revenue: Revenue,
    val bookingNumber: Int,
    val visitNumber: Int,
    val averageScore: Double,
)

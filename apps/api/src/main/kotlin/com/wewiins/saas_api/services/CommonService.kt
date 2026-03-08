package com.wewiins.saas_api.services

import com.wewiins.saas_api.interfaces.ActivityBooking
import com.wewiins.saas_api.interfaces.Revenue
import com.wewiins.saas_api.repositories.ActivityRepository
import com.wewiins.saas_api.repositories.BookingRepository
import com.wewiins.saas_api.repositories.StatisticRepository
import com.wewiins.saas_api.repositories.StripeRepository
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory

class CommonService(
    private val activityRepository: ActivityRepository,
    private val stripeRepository: StripeRepository,
    private val statisticRepository: StatisticRepository,
    private val bookingRepository: BookingRepository,
) {
    private val logger = LoggerFactory.getLogger(CommonService::class.java)

    fun getTotalRevenueByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Revenue {
        logger.info("Get TotalRevenueByPeriod")
        return runBlocking {
            stripeRepository.getRevenueByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getTotalBookingByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Int {
        logger.info("Get TotalBookingByPeriod")
        return runBlocking {
            bookingRepository.getBookingNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getTotalVisitByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Int {
        logger.info("Get TotalVisitByPeriod")
        return runBlocking {
            statisticRepository.getVisitNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getAverageScoreByPeriod(
        connectedAccountId: String, startDate: Long, endDate: Long
    ): Double {
        logger.info("Get AverageScoreByPeriod")
        return runBlocking {
            activityRepository.getAverageScoreByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getBookingsByPeriod(
        connectedAccountId: String,
        startDate: Long,
    ): List<ActivityBooking> {
        logger.info("Get BookingsByPeriod")
        return runBlocking {
            bookingRepository.getBookingsByPeriod(connectedAccountId, startDate)
        }
    }
}
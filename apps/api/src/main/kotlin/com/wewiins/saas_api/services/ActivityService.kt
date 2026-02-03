package com.wewiins.saas_api.services

import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.dto.activity.ActivityBooking
import com.wewiins.saas_api.interfaces.DashboardStats
import com.wewiins.saas_api.interfaces.Revenue
import com.wewiins.saas_api.repositories.ActivityRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class ActivityService(
    private val activityRepository: ActivityRepository
) {
    private val logger = LoggerFactory.getLogger(ActivityService::class.java)

    fun getRevenueByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Revenue {
        logger.info("Get RevenueByPeriod")
        return runBlocking {
            activityRepository.getRevenueByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getBookingNumberByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info("Get BookingNumberByPeriod")
        return runBlocking {
            activityRepository.getBookingNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getVisitNumberByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info("Get VisitNumberByPeriod")
        return runBlocking {
            activityRepository.getVisitNumberByPeriod(connectedAccountId, startDate, endDate)
        }
    }

    fun getAverageScoreByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
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
            activityRepository.getBookingsByPeriod(connectedAccountId, startDate)
        }
    }

    fun updateDashboardStats(
        verifiedAccountDto: VerifiedAccountDto,
        startDate: Long,
        endDate: Long
    ): DashboardStats? {
        logger.info("Dashboard update started")

        return runBlocking {
            val revenueDeferred = async(Dispatchers.IO) {
                getRevenueByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val bookingNumberDeferred = async(Dispatchers.IO) {
                getBookingNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val visitNumberDeferred = async(Dispatchers.IO) {
                getVisitNumberByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val averageScoreDeferred = async(Dispatchers.IO) {
                getAverageScoreByPeriod(
                    verifiedAccountDto.stripeConnectedAccountId!!,
                    startDate,
                    endDate
                )
            }

            val revenue = revenueDeferred.await()
            val bookingNumber = bookingNumberDeferred.await()
            val visitNumber = visitNumberDeferred.await()
            val averageScore = averageScoreDeferred.await()

            logger.info("📊 Dashboard data fetched successfully")

            DashboardStats(
                revenue = revenue,
                bookingNumber = bookingNumber,
                visitNumber = visitNumber,
                averageScore = averageScore,
            )
        }
    }

}